const connection = require('../database/connection');

const createCarrinho = async (dataCarrinho, idLogado) => {
    const { produto_id, quantidade } = dataCarrinho;
    
    const [result] = await connection.execute('INSERT INTO carrinho(usuario_id, produto_id, quantidade) VALUES (?, ?, ?)',
        [idLogado, produto_id, quantidade]
    );

    const [aparelhoCriado] = await connection.execute('SELECT * FROM carrinho WHERE id = ?', [result.insertId]);

    return aparelhoCriado[0];
};

const getCarrinhoByUser = async (idLogado) => {
    const [produtos] = await connection.execute(`SELECT 
        c.id AS carrinho_id,
        c.usuario_id,
        c.produto_id,
        c.quantidade,
        p.nome AS produto_nome,
        a.nome AS aparelho_nome,
        p.preco,
        GROUP_CONCAT(i.url) AS imagens
        FROM 
        carrinho c
        JOIN 
        produtos p ON c.produto_id = p.id
        JOIN 
        aparelhos a ON p.aparelho_id = a.id
        LEFT JOIN 
        produto_imagens i ON p.id = i.produto_id
        WHERE 
        c.usuario_id = ?
        GROUP BY 
        c.id, c.usuario_id, c.produto_id, c.quantidade, p.nome, p.preco`,
        [idLogado]);
    return produtos;
};

const getQtdCarrinhoUser = async (idLogado) => {
    const [quantidade] = await connection.execute('SELECT COUNT(*) AS quantidade FROM carrinho WHERE usuario_id = ?', [idLogado]);

    return quantidade[0].quantidade;
};


const deleteCarrinho = async (id) => {
    const [result] = await connection.execute('DELETE FROM carrinho WHERE id = ?', [id]);
    
    return result;
};

module.exports = {
    createCarrinho,
    getCarrinhoByUser,
    getQtdCarrinhoUser,
    deleteCarrinho
};
