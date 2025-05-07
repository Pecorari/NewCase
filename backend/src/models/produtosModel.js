const connection = require('../database/connection');

const createProduto = async (dataProduto) => {
    const { nome, aparelho_id, cor, descricao, preco, categoria_id, estoque } = dataProduto;
    
    const [result] = await connection.execute('INSERT INTO produtos(nome, aparelho_id, cor, descricao, preco, categoria_id, estoque) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, aparelho_id, cor, descricao, preco, categoria_id, estoque]
    );

    const [produtoCriado] = await connection.execute('SELECT * FROM produtos WHERE id = ?', [result.insertId]);

    return produtoCriado[0];
};

const getAllProdutos = async () => {
    const [produtos] = await connection.execute(
        `SELECT p.*,
        GROUP_CONCAT(pi.url) AS imagens
        FROM produtos p
        LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
        GROUP BY p.id;`
    );

    return produtos;
};

const getProdutosDestaque = async () => {
    const [produtos] = await connection.execute(`
        SELECT p.*,
        GROUP_CONCAT(pi.url) AS imagens
        FROM produtos p
        LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
        WHERE p.destaque = 'sim'
        GROUP BY p.id;`);

    return produtos;
};

const getSearchHeader = async (busca) => {
    const [produtos] = await connection.execute(`
    SELECT 
        produtos.*,
        categorias.nome AS categoria,
        aparelhos.nome AS aparelho
      FROM produtos
      JOIN categorias ON produtos.categoria_id = categorias.id
      JOIN aparelhos ON produtos.aparelho_id = aparelhos.id
      WHERE 
        produtos.nome LIKE CONCAT(?) OR
        produtos.cor LIKE CONCAT(?) OR
        categorias.nome LIKE CONCAT(?) OR
        aparelhos.nome LIKE CONCAT(?)`,
    [busca, busca, busca, busca]);
    return produtos;
};

const getFilteredProdutos = async (filtros) => {
    const { categoria, aparelho, preco_min, preco_max, cor, avaliacao } = filtros;

    let sql = `SELECT p.*, GROUP_CONCAT(pi.url) AS imagens FROM produtos p LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
        JOIN categorias c ON p.categoria_id = c.id
        JOIN aparelhos a ON p.aparelho_id = a.id WHERE 1=1`;
    let params = [];
  
    if (categoria) {
      sql += ` AND c.nome = ?`;
      params.push(categoria);
    }

    if (aparelho) {
        sql += ` AND a.nome = ?`;
        params.push(aparelho)
    }
  
    if (preco_min) {
      sql += ` AND p.preco >= ?`;
      params.push(preco_min);
    }
  
    if (preco_max) {
      sql += ` AND p.preco <= ?`;
      params.push(preco_max);
    }
  
    if (cor) {
      sql += ` AND p.cor = ?`;
      params.push(cor);
    }
  
    if (avaliacao) {
      sql += ` AND p.avaliacao_media = ?`;
      params.push(avaliacao);
    }

    sql += ` GROUP BY p.id`;
  
    const [produtos] = await connection.execute(sql, params);

    return produtos;
};

const getUniqueProduto = async (id) => {
    const [produto] = await connection.execute(`
        SELECT p.*,
        GROUP_CONCAT(pi.url) AS imagens,
        AVG(a.avaliacao) AS avaliacao_media
        FROM produtos p
        LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
        LEFT JOIN avaliacoes a ON p.id = a.produto_id
        WHERE p.id = ?
        GROUP BY p.id;`, [id]);

    return produto[0];
};

const updateProduto = async (dataProduto, id) => {
    const { nome, aparelho_id, cor, descricao, preco, categoria_id, estoque } = dataProduto;

    await connection.execute('UPDATE produtos SET nome=?, aparelho_id=?, cor=?, descricao=?, preco=?, categoria_id=?, estoque=? WHERE id = ?',
        [nome, aparelho_id, cor, descricao, preco, categoria_id, estoque, id]
    );

    const [produtoAtualizado] = await connection.execute('SELECT * FROM produtos WHERE id = ?', [id]);

    return produtoAtualizado[0];
};

const deleteProduto = async (id) => {
    const [result] = await connection.execute('DELETE FROM produtos WHERE id = ?', [id]);
    
    return result;
};

module.exports = {
    createProduto,
    getAllProdutos,
    getProdutosDestaque,
    getSearchHeader,
    getFilteredProdutos,
    getUniqueProduto,
    updateProduto,
    deleteProduto
};
