const axios = require("axios");
const connection = require('../database/connection');
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

const pagamento = async (req, res) => {
  try {
    const { metodo, pedido, cliente, endereco_entrega, pagamento } = req.body;

    const taxId = (cliente.cpf || "").replace(/\D/g, "");
    if (taxId.length !== 11) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    const telefoneNumeros =(cliente.telefone || '').replace(/\D/g, "");
    const ddd = telefoneNumeros.substring(0, 2) || '99';
    const numero = telefoneNumeros.substring(2) || '999999999';

    const items = pedido.itens.map((item, idx) => ({
      reference_id: item.produto_id,
      name: `Produto ${item.produto_id}`,
      quantity: item.quantidade,
      unit_amount: Math.round(Number(item.preco_unitario) * 100)
    }));

    const body = {
      reference_id: String(pedido.id),
      customer: {
        name: cliente.nome,
        email: cliente.email,
        tax_id: taxId,
        phones: [
          {
            country: "55",
            area: ddd,
            number: numero,
            type: "MOBILE"
          }
        ]
      },
      items,
      shipping: {
        address: {
          street: endereco_entrega.rua,
          number: endereco_entrega.numero,
          locality: endereco_entrega.bairro,
          city: endereco_entrega.cidade,
          region_code: endereco_entrega.estado,
          country: "BRA",
          postal_code: endereco_entrega.cep.replace(/\D/g, "")
        }
      },
      notification_urls: [
        process.env.PAGBANK_NOTIFICATION
      ]
    };

    if (metodo === 'cartao' || metodo === 'boleto') {
      body.charges = [
        {
          reference_id: pedido.id,
          description: "Pagamento do pedido",
          amount: {
            value: Math.round(Number(pedido.total) * 100),
            currency: "BRL"
          },
          payment_method: {},
        }
      ]
    }

    if (metodo === "cartao") {
      body.charges[0].payment_method = {
        type: pagamento.cartao.tipo === "debito" ? "DEBIT_CARD" : "CREDIT_CARD",
        installments: 1,
        capture: true,
        card: {
          encrypted: pagamento.cartao.encrypted,
          store: false,
        },
        holder: {
          name: pagamento.cartao.titular,
          tax_id: taxId,
        }
      };
    } else if (metodo === "boleto") {
      body.charges[0].payment_method = {
        type: "BOLETO",
        boleto: {
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          instruction_lines: {
            line_1: "Pagamento do pedido",
            line_2: "YourCase"
          },
          holder: {
            name: cliente.nome,
            tax_id: taxId,
            email: cliente.email,
            address: {
              country: "Brasil",
              region: endereco_entrega.estado,
              region_code:  endereco_entrega.estado,
              city: endereco_entrega.cidade,
              postal_code: endereco_entrega.cep.replace(/\D/g, ""),
              street: endereco_entrega.rua,
              number: endereco_entrega.numero,
              locality:  endereco_entrega.bairro
            }
          }
        }
      };
    } else if (metodo === "pix") {
      const date = new Date(Date.now() + 1 * 60 * 60 * 1000);
      
      const expirationDate = Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date).replace(" ", "T") + "-03:00";

      body.qr_codes = [
        {
          amount: {
            value: Math.round(Number(pedido.total) * 100),
            currency: 'BRL'
          },
          expiration_date: expirationDate,
          arrangements: ["PAGBANK"]
        }
      ];
    }

    const response = await axios.post(`${process.env.PAGBANK_API}/orders`, body,
      {headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`
      }}
    );

    const dadosOrder = response.data;

    await connection.execute(`UPDATE pedidos SET pagbank_ped_id = ? WHERE id = ?`, [dadosOrder.id , pedido.id]);

    await connection.execute(`INSERT INTO pagamentos (pedido_id, metodo_pagamento, status_pagamento, valor_pago) VALUES (?, ?, ?, ?)`,
      [
        pedido.id,
        metodo.toUpperCase(),
        "Pendente",
        Number(pedido.total)
      ]
    );

    return res.json(dadosOrder);
  } catch (err) {
    console.error("Erro no pagamento:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error_messages });
  }
};

const notificacao = async (req, res) => { 
  try {
    console.log("Notificação recebida:", req.body);

    const webhook = req.body;
    const { reference_id, charges } = webhook;
    const pedidoId = Number(reference_id);
    const charge = charges[0];

    const pagbank_pag_id = charge.id;
    const status = charge.status;
    const metodo = charge.payment_method?.type || "DESCONHECIDO";
    const valor = charge.amount?.value ? charge.amount.value / 100 : 0;

    if (status === "PAID") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Aprovado', metodo_pagamento = ?, valor_pago = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Preparando para envio' WHERE id = ?`, [pedidoId]);
    } else if (status === "WAITING" || status === "IN_ANALYSIS") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Pendente', metodo_pagamento = ?, valor_pago = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Aguardando pagamento' WHERE id = ?`, [pedidoId]);
    } else if (status === "CANCELED" || status === "DECLINED") {
      await connection.execute(`UPDATE pagamentos SET status_pagamento = 'Cancelado', metodo_pagamento = ?, valor_pago = ?, pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[metodo, valor, pagbank_pag_id, status, pedidoId]);
      await connection.execute(`UPDATE pedidos SET status = 'Cancelado' WHERE id = ?`, [pedidoId]);
    } else {
      await connection.execute(`UPDATE pagamentos SET pagbank_pag_id = ?, pagbank_status = ? WHERE pedido_id = ?`,[pagbank_pag_id, status, pedidoId]);
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
  pagamento,
  notificacao
};
