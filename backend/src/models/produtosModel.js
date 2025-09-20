const connection = require('../database/connection');

const createProduto = async (dataProduto) => {
    const { nome, aparelho_id, cor, descricao, preco, categoria_id, estoque, destaque, peso, altura, largura, comprimento, imagens } = dataProduto;
    
    const [result] = await connection.execute('INSERT INTO produtos(nome, aparelho_id, cor, descricao, preco, categoria_id, estoque, destaque, peso, altura, largura, comprimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, aparelho_id, cor, descricao, preco, categoria_id, estoque, destaque || 'nao', peso, altura, largura, comprimento]
    );
    
    if (imagens && imagens.length > 0) {
        for (const img of imagens) {
            if(img.acao === 'nova') {
                await connection.execute('INSERT INTO produto_imagens(produto_id, url) VALUES (?, ?)',[result.insertId, img.url]);
            }
        }
    }

    const [produtoCriado] = await connection.execute('SELECT * FROM produtos WHERE id = ?', [result.insertId]);

    return produtoCriado[0];
};

const getAllProdutos = async (page, limit) => {
    const offset = (page - 1) * limit;
    
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);

     const [rows] = await connection.execute(`
        SELECT
            p.*,
            JSON_ARRAYAGG(
                JSON_OBJECT('id', pi.id, 'url', pi.url)
            ) AS imagens
        FROM
            produtos p
        LEFT JOIN
            produto_imagens pi ON p.id = pi.produto_id
        GROUP BY
            p.id
        LIMIT ${limitInt} OFFSET ${offsetInt}
    `);

    const produtos = rows.map(row => {
        let imagens = [];
        if (typeof row.imagens === 'string') {
            try {
                imagens = JSON.parse(row.imagens);
            } catch (e) {
                console.error("Erro ao fazer o parse do JSON das imagens:", e);
            }
        } else if (Array.isArray(row.imagens)) {
            imagens = row.imagens;
        }

        return {
            ...row,
            imagens: imagens
        };
    });
    
    const [[{ total }]] = await connection.execute(`SELECT COUNT(*) AS total FROM produtos`);

    return { produtos, total };
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
            aparelhos.nome LIKE CONCAT(?)`, [busca, busca, busca, busca]
    );
    return produtos;
};

const getFilteredProdutos = async (filtros, page = 1, limit = 16) => {
    const { categoria, aparelho, preco_min, preco_max, cor, avaliacao } = filtros;

    let whereSql = 'WHERE 1=1';
    let params = [];

    if (categoria) { whereSql += ' AND c.nome = ?'; params.push(categoria); }
    if (aparelho) { whereSql += ' AND a.nome = ?'; params.push(aparelho); }
    if (preco_min != null) { whereSql += ' AND p.preco >= ?'; params.push(preco_min); }
    if (preco_max != null) { whereSql += ' AND p.preco <= ?'; params.push(preco_max); }
    if (cor) { whereSql += ' AND p.cor = ?'; params.push(cor); }
    if (avaliacao != null) { whereSql += ' AND p.avaliacao_media = ?'; params.push(avaliacao); }

    const offset = (page - 1) * limit;

    const [produtos] = await connection.execute(`
        SELECT p.*, GROUP_CONCAT(pi.url) AS imagens
        FROM produtos p
        LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
        JOIN categorias c ON p.categoria_id = c.id
        JOIN aparelhos a ON p.aparelho_id = a.id
        ${whereSql}
        GROUP BY p.id
        LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
    `, params);

    const [countResult] = await connection.execute(`
        SELECT COUNT(*) AS total
        FROM produtos p
        JOIN categorias c ON p.categoria_id = c.id
        JOIN aparelhos a ON p.aparelho_id = a.id
        ${whereSql}`, params);

    const total = countResult[0].total;

    return { produtos, total };
};

const getUniqueProduto = async (id) => {
    const [produto] = await connection.execute(`
        SELECT p.*,
        a.nome AS aparelho_nome,
        GROUP_CONCAT(pi.url) AS imagens,
        AVG(av.avaliacao) AS avaliacao_media
        FROM produtos p
        JOIN aparelhos a ON p.aparelho_id = a.id
        LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
        LEFT JOIN avaliacoes av ON p.id = av.produto_id
        WHERE p.id = ?
        GROUP BY p.id, a.nome;
        `, [id]);

    return produto[0];
};

const updateProduto = async (dataProduto, id) => {
    const { nome, aparelho_id, cor, descricao, preco, categoria_id, estoque, destaque, peso, altura, largura, comprimento, imagens  } = dataProduto;

    await connection.execute('UPDATE produtos SET nome=?, aparelho_id=?, cor=?, descricao=?, preco=?, categoria_id=?, estoque=?, destaque=?, peso=?, altura=?, largura=?, comprimento=? WHERE id = ?',
        [nome, aparelho_id, cor, descricao, preco, categoria_id, estoque, destaque, peso, altura, largura, comprimento , id]
    );

    if (imagens && imagens.length > 0) {
        for (const img of imagens) {
            if (img.acao === "remover" && img.id) {
                await connection.execute('DELETE FROM produto_imagens WHERE id = ?', [img.id]);
            } else if (img.acao === "nova" && img.url) {
                await connection.execute('INSERT INTO produto_imagens (produto_id, url) VALUES (?, ?)', [id, img.url]);
            }
        }
    }

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
