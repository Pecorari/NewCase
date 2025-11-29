const connection = require('../database/connection');
const enderecosController = require('../controllers/enderecosController');

const createPedidoWithConn = async (conn, dataPedido, cliente, itens, idLogado) => {
  const { total, endereco_id, frete_id, frete_nome, frete_logo, frete_valor, frete_prazo } = dataPedido;
  const { nome, cpf, email, telefone } = cliente;

  const [result] = await conn.execute(`
    INSERT INTO pedidos(usuario_id, total, status, cliente_nome, cliente_cpf, cliente_email, cliente_telefone, endereco_id, frete_id, frete_nome, frete_logo, frete_valor, frete_prazo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [idLogado, total, 'Aguardando Pagamento', nome, cpf, email, telefone, endereco_id, frete_id, frete_nome, frete_logo, frete_valor, frete_prazo]);

  const pedidoId = result.insertId;

  for (const item of itens) {
    await conn.execute(
      'INSERT INTO pedido_itens (pedido_id, produto_id, preco_unitario, quantidade) VALUES (?, ?, ?, ?)',
      [pedidoId, item.produto_id, item.preco_unitario, item.quantidade]
    );
  }

  const [pedidoCriado] = await conn.execute('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
  const [pedidoItensCriado] = await conn.execute('SELECT * FROM pedido_itens WHERE pedido_id = ?', [pedidoId]);

  return {
    pedido: pedidoCriado[0],
    itensPedido: pedidoItensCriado,
  };
};

const getAllMyPedidos = async (idLogado) => {
  const [pedidos] = await connection.execute('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC', [idLogado]);

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
      p.cliente_nome,
      p.cliente_cpf,
      p.cliente_email,
      p.cliente_telefone,
      p.endereco_id,
      e.rua AS endereco_rua,
      e.numero AS endereco_numero,
      e.bairro AS endereco_bairro,
      e.cidade AS endereco_cidade,
      e.estado AS endereco_estado,
      e.complemento AS endereco_complemento,
      e.cep AS endereco_cep,
      p.frete_id,
      p.frete_nome,
      p.frete_logo,
      p.frete_valor,
      p.frete_prazo,
      p.etiqueta_id,
      p.etiqueta_url,
      p.frete_protocolo,
      p.frete_rastreio,
      p.frete_status,
      p.pagbank_ped_id,
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
      pr.peso AS produto_peso,
      pr.comprimento AS produto_comprimento,
      pr.largura AS produto_largura,
      pr.altura AS produto_altura,
      pi.quantidade,
      pi.preco_unitario,
      
      -- Pagamento
      pg.id AS pagamento_id,
      pg.metodo_pagamento,
      pg.status_pagamento,
      pg.valor_total,
      pg.pago_em,
      
      -- Imagem do produto
      pri.url AS produto_imagem_url,

      -- Compatibilidade do produto
      aparelhos.nome AS aparelho_nome

    FROM pedidos AS p
    JOIN usuarios AS u ON u.id = p.usuario_id
    LEFT JOIN enderecos AS e ON e.id = p.endereco_id
    LEFT JOIN pedido_itens AS pi ON pi.pedido_id = p.id
    LEFT JOIN produtos AS pr ON pr.id = pi.produto_id
    LEFT JOIN pagamentos AS pg ON pg.pedido_id = p.id
    LEFT JOIN produto_imagens AS pri ON pri.produto_id = pr.id
    LEFT JOIN aparelhos ON pr.aparelho_id = aparelhos.id
    ORDER BY p.id DESC, pi.id ASC;
  `);

  const pedidosMap = {};

  rows.forEach(row => {
    if (!pedidosMap[row.pedido_id]) {
      pedidosMap[row.pedido_id] = {
        pedido_id: row.pedido_id,
        usuario_id: row.usuario_id,
        total: row.total,
        status: row.status_pedido,
        etiqueta_id: row.etiqueta_id,
        etiqueta_url: row.etiqueta_url,
        frete_protocolo: row.frete_protocolo,
        frete_rastreio: row.frete_rastreio,
        frete_status: row.frete_status,
        pagbank_ped_id: row.pagbank_ped_id,
        destinatario: {
          nome: row.cliente_nome,
          cpf: row.cliente_cpf,
          email: row.cliente_email,
          telefone: row.cliente_telefone,
        },
        endereco: {
          endereco_id: row.endereco_id,
          endereco_rua: row.endereco_rua,
          endereco_numero: row.endereco_numero,
          endereco_bairro: row.endereco_bairro,
          endereco_cidade: row.endereco_cidade,
          endereco_estado: row.endereco_estado,
          endereco_complemento: row.endereco_complemento || '',
          endereco_cep: row.endereco_cep,
        },
        frete: {
          frete_id: row.frete_id,
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
              valor: row.valor_total,
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
        produto_peso: row.produto_peso,
        produto_comprimento: row.produto_comprimento,
        produto_largura: row.produto_largura,
        produto_altura: row.produto_altura,
        quantidade: row.quantidade,
        preco_unitario: row.preco_unitario,
      });
    }
  });

  const pedidos = Object.values(pedidosMap);
  pedidos.sort((a, b) => b.pedido_id - a.pedido_id);

  return pedidos;
};

const getAdminPedidoBySearch = async (value) => {
  const [rows] = await connection.execute(`
    SELECT 
      -- Pedido
      p.id AS pedido_id,
      p.usuario_id,
      p.total,
      p.status AS status_pedido,
      p.cliente_nome,
      p.cliente_cpf,
      p.cliente_email,
      p.cliente_telefone,
      p.endereco_id,
      e.rua AS endereco_rua,
      e.numero AS endereco_numero,
      e.bairro AS endereco_bairro,
      e.cidade AS endereco_cidade,
      e.estado AS endereco_estado,
      e.complemento AS endereco_complemento,
      e.cep AS endereco_cep,
      p.frete_id,
      p.frete_nome,
      p.frete_logo,
      p.frete_valor,
      p.frete_prazo,
      p.etiqueta_id,
      p.etiqueta_url,
      p.frete_protocolo,
      p.frete_rastreio,
      p.frete_status,
      p.pagbank_ped_id,
      p.criado_em,

      -- Usuário
      u.nome AS usuario_nome,
      u.cpf AS usuario_cpf,
      u.telefone AS usuario_telefone,
      u.email AS usuario_email,

      -- Itens
      pi.id AS item_id,
      pi.produto_id,
      pr.nome AS produto_nome,
      pr.peso AS produto_peso,
      pr.comprimento AS produto_comprimento,
      pr.largura AS produto_largura,
      pr.altura AS produto_altura,
      pi.quantidade,
      pi.preco_unitario,

      -- Pagamento
      pg.id AS pagamento_id,
      pg.metodo_pagamento,
      pg.status_pagamento,
      pg.valor_total,
      pg.pago_em

    FROM pedidos p
    JOIN usuarios u ON u.id = p.usuario_id
    LEFT JOIN enderecos AS e ON e.id = p.endereco_id
    LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
    LEFT JOIN produtos pr ON pr.id = pi.produto_id
    LEFT JOIN pagamentos pg ON pg.pedido_id = p.id
    
    WHERE 
      p.id = ?
      OR LOWER(u.nome) LIKE CONCAT('%', LOWER(?), '%')
      OR REPLACE(u.cpf, '.', '') LIKE REPLACE(?, '.', '')
      OR REPLACE(u.cpf, '-', '') LIKE REPLACE(?, '-', '')

    ORDER BY p.id DESC, pi.id ASC;
  `, [value, value, value, value]);

  const pedidosMap = {};

  rows.forEach(row => {
    if (!pedidosMap[row.pedido_id]) {
      pedidosMap[row.pedido_id] = {
        pedido_id: row.pedido_id,
        usuario_id: row.usuario_id,
        total: row.total,
        status: row.status_pedido,
        etiqueta_id: row.etiqueta_id,
        etiqueta_url: row.etiqueta_url,
        frete_protocolo: row.frete_protocolo,
        frete_rastreio: row.frete_rastreio,
        frete_status: row.frete_status,
        pagbank_ped_id: row.pagbank_ped_id,
        destinatario: {
          nome: row.cliente_nome,
          cpf: row.cliente_cpf,
          email: row.cliente_email,
          telefone: row.cliente_telefone,
        },
        endereco: {
          endereco_id: row.endereco_id,
          endereco_rua: row.endereco_rua,
          endereco_numero: row.endereco_numero,
          endereco_bairro: row.endereco_bairro,
          endereco_cidade: row.endereco_cidade,
          endereco_estado: row.endereco_estado,
          endereco_complemento: row.endereco_complemento || '',
          endereco_cep: row.endereco_cep,
        },
        frete: {
          frete_id: row.frete_id,
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
              valor: row.valor_total,
              pago_em: row.pago_em,
            }
          : null,
      };
    }

    if (row.item_id) {
      pedidosMap[row.pedido_id].itens.push({
        id: row.item_id,
        produto_id: row.produto_id,
        nome: row.produto_nome,
        produto_peso: row.produto_peso,
        produto_comprimento: row.produto_comprimento,
        produto_largura: row.produto_largura,
        produto_altura: row.produto_altura,
        quantidade: row.quantidade,
        preco_unitario: row.preco_unitario,
      });
    }
  });
  
  const pedidos = Object.values(pedidosMap);
  pedidos.sort((a, b) => b.pedido_id - a.pedido_id);

  return pedidos;
};

const updateAdminPedido = async (id, dataPedido = {}, novosItens = [], novoPagamento = {}) => {
  const campos = [];
  const valores = [];

  if (dataPedido.total !== undefined) {
    campos.push('total = ?');
    valores.push(dataPedido.total);
  }

  if (dataPedido.status !== undefined) {
    campos.push('status = ?');
    valores.push(dataPedido.status);
  }

  if (dataPedido.etiqueta_url !== undefined) {
    campos.push('etiqueta_url = ?');
    valores.push(dataPedido.etiqueta_url);
  }
  
  if (dataPedido.etiqueta_id !== undefined) {
    campos.push('etiqueta_id = ?');
    valores.push(dataPedido.etiqueta_id);
  }

  if (dataPedido.frete_rastreio !== undefined) {
    campos.push("frete_rastreio = ?");
    valores.push(dataPedido.frete_rastreio);
  }
  if (dataPedido.frete_protocolo !== undefined) {
    campos.push("frete_protocolo = ?");
    valores.push(dataPedido.frete_protocolo);
  }
  if (dataPedido.frete_status !== undefined) {
    campos.push("frete_status = ?");
    valores.push(dataPedido.frete_status);
  }

  if (campos.length > 0) {
    await connection.execute(`UPDATE pedidos SET ${campos.join(', ')} WHERE id = ?`, [...valores, id]);
  }

  // Atualiza itens (se vierem)
  for (const item of novosItens) {
    await connection.execute('UPDATE pedido_itens SET quantidade = ? WHERE pedido_id = ? AND produto_id = ?', [item.quantidade, id, item.produto_id]);
  }

  // Atualiza pagamento (se vier)
  if (Object.keys(novoPagamento).length > 0) {
    await connection.execute('UPDATE pagamentos SET metodo_pagamento = ?, status_pagamento = ?, valor_total = ? WHERE pedido_id = ?',
      [
        novoPagamento.metodo_pagamento,
        novoPagamento.status_pagamento,
        novoPagamento.valor_total,
        id
      ]
    );
  }

  const [pedidoAtualizado] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
  const [itensAtualizados] = await connection.execute('SELECT * FROM pedido_itens WHERE pedido_id = ?', [id]);
  const [pagamentoAtualizado] = await connection.execute('SELECT * FROM pagamentos WHERE pedido_id = ?', [id]);

  return {
    pedido: pedidoAtualizado[0],
    itens: itensAtualizados,
    pagamento: pagamentoAtualizado[0]
  };
};

const updatePedidoByEtiquetaId = async (etiquetaId, data) => {
  const campos = [];
  const valores = [];

  if (data.frete_rastreio !== undefined) {
    campos.push("frete_rastreio = ?");
    valores.push(data.frete_rastreio);
  }
  if (data.frete_protocolo !== undefined) {
    campos.push("frete_protocolo = ?");
    valores.push(data.frete_protocolo);
  }
  if (data.frete_status !== undefined) {
    campos.push("frete_status = ?");
    valores.push(data.frete_status);
  }

  if (campos.length > 0) {
    await connection.execute(`UPDATE pedidos SET ${campos.join(", ")} WHERE etiqueta_id = ?`, [...valores, etiquetaId]);
  }
};

const deletePedido = async (id) => {
  const [result] = await connection.execute('DELETE FROM pedidos WHERE id = ?', [id]);

  return result;
};

module.exports = {
  createPedidoWithConn,
  getAllMyPedidos,
  getUniquePedido,
  cancelarPedido,
  getAdminPedidos,
  getAdminPedidoBySearch,
  updateAdminPedido,
  updatePedidoByEtiquetaId,
  deletePedido
}
