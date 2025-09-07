const axios = require("axios");
const connection = require('../database/connection');
const pedidosModel = require('../models/pedidosModel');
const montarBodyPagbank = require("../utils/montarBodyPagbank");
require('dotenv').config();

async function getPublicKeyFromDB(req, res) {
  try {
    const [rows] = await connection.execute("SELECT public_key, created_at FROM public_keys ORDER BY id DESC LIMIT 1");
    
    if (rows.length > 0) {
      const { public_key, created_at } = rows[0];
      const createdAt = new Date(created_at);
      
      const expired = (Date.now() - createdAt.getTime()) > (30 * 24 * 60 * 60 * 1000);
      if (!expired) {
        return res.status(200).json(public_key);
      }
    }

    const response = await axios.post("https://sandbox.api.pagseguro.com/public-keys", { type: "card" }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`
      }
    });

    const public_key = response.data.public_key;

    await connection.execute("INSERT INTO public_keys (public_key) VALUES (?)", [public_key]);

    return res.status(200).json(public_key);
  } catch (err) {
    console.error("Erro ao buscar public key:", err);
    return res.status(500).json({ error: "Erro ao buscar chave pública" });
  }
}

const checkout = async (req, res) => {
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    const { dataPedido, itens, metodo, cliente, endereco_entrega, pagamento } = req.body;

    const { pedido, itensPedido } = await pedidosModel.createPedidoWithConn(conn, dataPedido, itens, req.usuario.id);
  
    const body = montarBodyPagbank(pedido, itensPedido, metodo, cliente, endereco_entrega, pagamento);

    const response = await axios.post(`${process.env.PAGBANK_API}/orders`, body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`
      }
    });

    const dadosOrder = response.data;
    
    const chavePix = dadosOrder.qr_codes?.[0]?.text || null;
    const boletoPdf = dadosOrder.charges?.[0]?.links?.find(l => l.media === "application/pdf")?.href || null;
    const charge = dadosOrder.charges?.[0] || null;

    const status = charge?.status || null;
    const paid_at = charge?.paid_at ? new Date(charge.paid_at) : null;

    let status_pagamento = 'Pendente';
    if (status === "PAID" || status === "AUTHORIZED") status_pagamento = 'Aprovado';
    else if (status === "WAITING" || status === "IN_ANALYSIS") status_pagamento = 'Pendente';
    else if (status === "CANCELED" || status === "DECLINED") status_pagamento = 'Cancelado';
    else if (status === "EXPIRED") status_pagamento = 'Expirado';

    await conn.execute(`UPDATE pedidos SET pagbank_ped_id = ? WHERE id = ?`, [dadosOrder.id, pedido.id]);

    await conn.execute(`INSERT INTO pagamentos (pedido_id, metodo_pagamento, status_pagamento, valor_total, pago_em, chave_pix, link_boleto, pagbank_pag_id, pagbank_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pedido.id,
        metodo.toUpperCase(),
        status_pagamento,
        Number(pedido.total),
        paid_at,
        chavePix,
        boletoPdf,
        charge?.id || null,
        status
      ]
    );

    await conn.commit();

    return res.json({ dadosOrder, pedido});
  } catch (err) {
    await conn.rollback();
    console.error("Erro no checkout:", err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data?.error_messages || "Erro no checkout" });
  } finally {
    conn.release();
  }
};

const notificacao = async (req, res) => { 
  try {
    const webhook = req.body;
    const { reference_id, charges } = webhook;
    const pedidoId = Number(reference_id);
    const charge = charges[0];

    const pagbank_pag_id = charge.id;
    const status = charge.status;
    const paid_at = charge.paid_at ? new Date(charge.paid_at) : null;
    const metodo = charge.payment_method?.type || "DESCONHECIDO";
    const valor = charge.amount?.value ? charge.amount.value / 100 : 0;

    if (status === "PAID" || status === "AUTHORIZED") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Aprovado', valor_total = ?, pago_em = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, paid_at, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Preparando para envio' WHERE id = ?`, [pedidoId]);
    } else if (status === "WAITING" || status === "IN_ANALYSIS") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Pendente', valor_total = ?, pago_em = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, paid_at, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Aguardando pagamento' WHERE id = ?`, [pedidoId]);
    } else if (status === "CANCELED" || status === "DECLINED") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Cancelado', valor_total = ?, pago_em = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, paid_at, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Cancelado' WHERE id = ?`, [pedidoId]);
    } else if (status === "EXPIRED") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Expirado', valor_total = ?, pago_em = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, paid_at, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Cancelado' WHERE id = ?`, [pedidoId]);
    } else if (status === "CHARGEBACK" || status === "IN_DISPUTE")  {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Em análise', valor_total = ?, pago_em = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, paid_at, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Cancelado' WHERE id = ?`, [pedidoId]);
    } if (status === "REFUNDED")  {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Reembolsado', valor_total = ?, pago_em = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, paid_at, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Cancelado' WHERE id = ?`, [pedidoId]);
    }

    console.log(`Pedido ${pedidoId} atualizado: ${status}`);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Erro na notificação:", err);
    return res.sendStatus(500);
  }
};

module.exports = {
  getPublicKeyFromDB,
  checkout,
  notificacao
};
