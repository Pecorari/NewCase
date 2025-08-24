const connection = require('../database/connection');

const createPedido = async (dataPedido, itens, idLogado) => {
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    
    const { total, endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep, endereco_complemento, frete_nome, frete_logo, frete_valor, frete_prazo} = dataPedido;
    const [result] = await connection.execute(`
      INSERT INTO pedidos(usuario_id, total, status, endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep, endereco_complemento, frete_nome, frete_logo, frete_valor, frete_prazo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [idLogado, total, 'Aguardando Pagamento', endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep, endereco_complemento, frete_nome, frete_logo, frete_valor, frete_prazo]);

    const pedidoId = result.insertId;

    for (const item of itens) {
      await connection.execute('INSERT INTO pedido_itens (pedido_id, produto_id, preco_unitario, quantidade) VALUES (?, ?, ?, ?)',
        [pedidoId, item.produto_id, item.preco_unitario, item.quantidade]);
    }

    const [pedidoCriado] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    const [pedidoItensCriado] = await connection.execute('SELECT * FROM pedido_itens WHERE pedido_id = ?', [pedidoId]);

    await conn.commit();

    return {
      pedido: pedidoCriado[0],
      itens: pedidoItensCriado,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getAllMyPedidos = async (idLogado) => {
  const [pedidos] = await connection.execute('SELECT * FROM pedidos WHERE usuario_id = ?', [idLogado]);

  return pedidos;
};

const getUniquePedido = async (id, idLogado) => {
  const [pedido] = await connection.execute('SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?', [id, idLogado]);
  const [itens] = await connection.execute(`
     SELECT pedido_itens.*,
            produtos.nome AS produto_nome,
            aparelhos.nome AS aparelho_nome,
            GROUP_CONCAT(produto_imagens.url) AS imagens
          FROM pedido_itens JOIN produtos ON pedido_itens.produto_id = produtos.id
          LEFT JOIN produto_imagens ON pedido_itens.produto_id = produto_imagens.produto_id
          LEFT JOIN aparelhos ON produtos.aparelho_id = aparelhos.id
          WHERE pedido_itens.pedido_id = ?
          GROUP BY pedido_itens.id`, [id]);
  const [pagamento] = await connection.execute('SELECT * FROM pagamentos WHERE pedido_id = ?', [id]);

  const pedidoCompleto = {
    pedido,
    itens: itens,
    pagamento: pagamento
  };

  return pedidoCompleto;
};

const cancelarPedido = async (id, idLogado) => {
  await connection.execute(`UPDATE pedidos SET status = 'cancelado' WHERE id = ? AND usuario_id = ?`, [id, idLogado]);

  const [pedidoCancelado] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [id]);

  return {
    pedido: pedidoCancelado[0],
  };
};

const getAdminPedidos = async () => {
  const [rows] = await connection.execute(`
SELECT
      -- Pedido
      p.id AS pedido_id,
      p.usuario_id,
      p.total,
      p.status AS status_pedido,
      p.endereco_rua,
      p.endereco_numero,
      p.endereco_bairro,
      p.endereco_cidade,
      p.endereco_estado,
      p.endereco_cep,
      p.endereco_complemento,
      p.frete_nome,
      p.frete_logo,
      p.frete_valor,
      p.frete_prazo,
      p.criado_em,
      
      -- Usuário
      u.nome AS usuario_nome,
      u.cpf AS usuario_cpf,
      u.telefone AS usuario_telefone,
      u.email AS usuario_email,
      
      -- Itens do pedido
      pi.id AS item_id,
      pi.produto_id,
      pr.nome AS produto_nome,
      pi.quantidade,
      pi.preco_unitario,
      
      -- Pagamento
      pg.id AS pagamento_id,
      pg.metodo_pagamento,
      pg.status_pagamento,
      pg.valor_pago,
      pg.pago_em,
      
      -- Imagem do produto
      pri.url AS produto_imagem_url,

      -- Compatibilidade do produto
      aparelhos.nome AS aparelho_nome

    FROM pedidos AS p
    JOIN usuarios AS u ON u.id = p.usuario_id
    LEFT JOIN pedido_itens AS pi ON pi.pedido_id = p.id
    LEFT JOIN produtos AS pr ON pr.id = pi.produto_id
    LEFT JOIN pagamentos AS pg ON pg.pedido_id = p.id
    LEFT JOIN produto_imagens AS pri ON pri.produto_id = pr.id
    LEFT JOIN aparelhos ON pr.aparelho_id = aparelhos.id
    ORDER BY p.id, pi.id;
  `);

  const pedidosMap = {};

  rows.forEach(row => {
    if (!pedidosMap[row.pedido_id]) {
      pedidosMap[row.pedido_id] = {
        pedido_id: row.pedido_id,
        usuario_id: row.usuario_id,
        total: row.total,
        status: row.status_pedido,
        endereco: {
          rua: row.endereco_rua,
          numero: row.endereco_numero,
          bairro: row.endereco_bairro,
          cidade: row.endereco_cidade,
          estado: row.endereco_estado,
          cep: row.endereco_cep,
          complemento: row.endereco_complemento,
        },
        frete: {
          nome: row.frete_nome,
          logo: row.frete_logo,
          valor: row.frete_valor,
          prazo: row.frete_prazo,
        },
        criado_em: row.criado_em,
        usuario: {
          nome: row.usuario_nome,
          cpf: row.usuario_cpf,
          telefone: row.usuario_telefone,
          email: row.usuario_email,
        },
        itens: [],
        pagamento: row.pagamento_id
          ? {
              id: row.pagamento_id,
              metodo: row.metodo_pagamento,
              status: row.status_pagamento,
              valor: row.valor_pago,
              pago_em: row.pago_em,
            }
          : null,
      }
    };

    if (row.item_id) {
      pedidosMap[row.pedido_id].itens.push({
        id: row.item_id,
        produto_id: row.produto_id,
        produto_imagem_url: row.produto_imagem_url,
        nome: row.produto_nome,
        aparelho_nome: row.aparelho_nome,
        quantidade: row.quantidade,
        preco_unitario: row.preco_unitario,
      });
    }
  });

  return Object.values(pedidosMap);
};

const getAdminPedidoBySearch = async (value) => {
  const [rows] = await connection.execute(`
    SELECT 
      -- Pedido
      p.id AS pedido_id,
      p.usuario_id,
      p.total,
      p.status AS status_pedido,
      p.endereco_rua,
      p.endereco_numero,
      p.endereco_bairro,
      p.endereco_cidade,
      p.endereco_estado,
      p.endereco_cep,
      p.endereco_complemento,
      p.frete_nome,
      p.frete_logo,
      p.frete_valor,
      p.frete_prazo,
      p.criado_em,

      -- Usuário
      u.nome AS usuario_nome,
      u.cpf AS usuario_cpf,
      u.telefone AS usuario_telefone,
      u.email AS usuario_email,

      -- Itens do pedido
      pi.id AS item_id,
      pi.produto_id,
      pr.nome AS produto_nome,
      pi.quantidade,
      pi.preco_unitario,

      -- Pagamento
      pg.id AS pagamento_id,
      pg.metodo_pagamento,
      pg.status_pagamento,
      pg.valor_pago,
      pg.pago_em

    FROM pedidos p
    JOIN usuarios u ON u.id = p.usuario_id
    LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
    LEFT JOIN produtos pr ON pr.id = pi.produto_id
    LEFT JOIN pagamentos pg ON pg.pedido_id = p.id
    WHERE p.id = ? OR LOWER(u.nome) LIKE CONCAT('%', LOWER(?), '%')
    ORDER BY p.id, pi.id;
  `, [value, value]);

  const pedidosMap = {};

  rows.forEach(row => {
    if (!pedidosMap[row.pedido_id]) {
      pedidosMap[row.pedido_id] = {
        pedido_id: row.pedido_id,
        usuario_id: row.usuario_id,
        total: row.total,
        status: row.status_pedido,
        endereco: {
          rua: row.endereco_rua,
          numero: row.endereco_numero,
          bairro: row.endereco_bairro,
          cidade: row.endereco_cidade,
          estado: row.endereco_estado,
          cep: row.endereco_cep,
          complemento: row.endereco_complemento,
        },
        frete: {
          nome: row.frete_nome,
          logo: row.frete_logo,
          valor: row.frete_valor,
          prazo: row.frete_prazo,
        },
        criado_em: row.criado_em,
        usuario: {
          nome: row.usuario_nome,
          cpf: row.usuario_cpf,
          telefone: row.usuario_telefone,
          email: row.usuario_email,
        },
        itens: [],
        pagamento: row.pagamento_id
          ? {
              id: row.pagamento_id,
              metodo: row.metodo_pagamento,
              status: row.status_pagamento,
              valor: row.valor_pago,
              pago_em: row.pago_em,
            }
          : null,
      }
    };

    if (row.item_id) {
      pedidosMap[row.pedido_id].itens.push({
        id: row.item_id,
        produto_id: row.produto_id,
        nome: row.produto_nome,
        quantidade: row.quantidade,
        preco_unitario: row.preco_unitario,
      });
    }
  });

  return Object.values(pedidosMap);
};


const updateAdminPedido = async (id, dataPedido, novosItens, novoPagamento) => {
  const { total, status } = dataPedido;
  await connection.execute('UPDATE pedidos SET total = ?, status = ? WHERE id = ?', [total, status, id]);

  for (const item of novosItens) {
    await connection.execute(
      'UPDATE pedido_itens SET quantidade = ? WHERE pedido_id = ? AND produto_id = ?',
      [item.quantidade, id, item.produto_id]
    );
  }

  await connection.execute(
    'UPDATE pagamentos SET metodo_pagamento = ?, status_pagamento = ?, valor_pago = ? WHERE pedido_id = ?',
    [novoPagamento.metodo_pagamento, novoPagamento.status_pagamento, novoPagamento.valor_pago, id]
  );

  const [pedidoAtualizado] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
  const [itensAtualizados] = await connection.execute('SELECT * FROM pedido_itens WHERE pedido_id = ?', [id]);
  const [pagamentoAtualizado] = await connection.execute('SELECT * FROM pagamentos WHERE pedido_id = ?', [id]);

  return {
    pedido: pedidoAtualizado[0],
    itens: itensAtualizados,
    pagamento: pagamentoAtualizado[0]
  };
};

const deletePedido = async (id) => {
  const [result] = await connection.execute('DELETE FROM pedidos WHERE id = ?', [id]);

  return result;
};

module.exports = {
  createPedido,
  getAllMyPedidos,
  getUniquePedido,
  cancelarPedido,
  getAdminPedidos,
  getAdminPedidoBySearch,
  updateAdminPedido,
  deletePedido
}
