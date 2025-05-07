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
    const [produtos] = await connection.execute('SELECT * FROM carrinho WHERE usuario_id = ?', [idLogado]);
    return produtos;
};


const deleteCarrinho = async (id) => {
    const [result] = await connection.execute('DELETE FROM carrinho WHERE id = ?', [id]);
    
    return result;
};

module.exports = {
    createCarrinho,
    getCarrinhoByUser,
    deleteCarrinho
};
