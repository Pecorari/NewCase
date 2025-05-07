const connection = require('../database/connection');

const createPedido = async (dataPedido, itens, dataPagamento, idLogado) => {
  const { total } = dataPedido;
  const [result] = await connection.execute('INSERT INTO pedidos(usuario_id, total) VALUES (?, ?)', [idLogado, total]);

  const pedidoId = result.insertId;

  for (const item of itens) {
    await connection.execute('INSERT INTO pedido_itens (pedido_id, produto_id, preco_unitario, quantidade) VALUES (?, ?, ?, ?)',
      [pedidoId, item.produto_id, item.preco_unitario, item.quantidade]);
  }

  const { metodo_pagamento, valor_pago } = dataPagamento;
  await connection.execute('INSERT INTO pagamentos (pedido_id, metodo_pagamento, valor_pago) VALUES (?, ?, ?)', [pedidoId, metodo_pagamento, valor_pago]);


  const [pedidoCriado] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
  const [pedidoItensCriado] = await connection.execute('SELECT * FROM pedido_itens WHERE pedido_id = ?', [pedidoId]);
  const [pagamentoCriado] = await connection.execute('SELECT * FROM pagamentos WHERE pedido_id = ?', [pedidoId]);

  return {
    pedido: pedidoCriado[0],
    itens: pedidoItensCriado,
    pagamento: pagamentoCriado[0]
  };
};

const getAllMyPedidos = async (idLogado) => {
  const [pedidos] = await connection.execute('SELECT * FROM pedidos WHERE usuario_id = ?', [idLogado]);

  return pedidos;
};

const getUniquePedido = async (id, idLogado) => {
  const [pedido] = await connection.execute('SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?', [id, idLogado]);
  const [itens] = await connection.execute(`SELECT pedido_itens.*, produtos.nome AS produto_nome,  aparelhos.nome AS aparelho_nome, GROUP_CONCAT(produto_imagens.url) AS imagens
    FROM pedido_itens JOIN produtos ON pedido_itens.produto_id = produtos.id LEFT JOIN produto_imagens ON pedido_itens.produto_id = produto_imagens.produto_id
    LEFT JOIN aparelhos ON produtos.aparelho_id = aparelhos.id WHERE pedido_itens.pedido_id = 5 GROUP BY pedido_itens.id`, [id]);
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
  const [pedidos] = await connection.execute('SELECT * FROM pedidos');
  const [itens] = await connection.execute('SELECT * FROM pedido_itens');
  const [pagamentos] = await connection.execute('SELECT * FROM pagamentos');

  const pedidosCompletos = pedidos.map(pedido => {
    const pedidoItens = itens.filter(item => item.pedido_id === pedido.id);
    const pagamento = pagamentos.find(p => p.pedido_id === pedido.id);

    return {
      ...pedido,
      itens: pedidoItens,
      pagamento: pagamento || null
    };
  });

  return pedidosCompletos;
};

const getAdminPedidoById = async (id) => {
  const [pedido] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
  const [itens] = await connection.execute('SELECT * FROM pedido_itens WHERE id = ?', [id]);
  const [pagamento] = await connection.execute('SELECT * FROM pagamentos WHERE id = ?', [id]);

  const pedidoCompleto = {
    pedido,
    itens: itens,
    pagamento: pagamento
  };

  return pedidoCompleto;
};

const getAdminPedidoByUser = async (id) => {
  const [pedido] = await connection.execute('SELECT * FROM pedidos WHERE usuario_id = ?', [id]);
  const [itens] = await connection.execute('SELECT * FROM pedido_itens WHERE pedido_id = ?', [pedido[0].id]);
  const [pagamento] = await connection.execute('SELECT * FROM pagamentos WHERE pedido_id = ?', [pedido[0].id]);

  const pedidoCompleto = {
    pedido,
    itens: itens,
    pagamento: pagamento
  };

  return pedidoCompleto;
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
  getAdminPedidoById,
  getAdminPedidoByUser,
  updateAdminPedido,
  deletePedido
}
