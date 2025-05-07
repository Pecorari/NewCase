const connection = require('../database/connection');

const createAvaliacao = async (dataAvaliacao, user_id) => {
    const { produtoId, comentario, avaliacao } = dataAvaliacao;

    const [result] = await connection.execute('INSERT INTO avaliacoes(produto_id, usuario_id, comentario, avaliacao) VALUES (?, ?, ?, ?)',
        [produtoId, user_id, comentario, avaliacao]
    );

    const [avaliacaoCriada] = await connection.execute('SELECT * FROM avaliacoes WHERE id = ?', [result.insertId]);

    return avaliacaoCriada[0];
};

const getProductAvaliacoes = async (produtoId) => {
    const [aparelhos] = await connection.execute(`
        SELECT a.id, a.produto_id, a.usuario_id, u.nome AS usuario_nome, a.comentario, a.avaliacao
        FROM avaliacoes a
        JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.produto_id = ?
        ORDER BY a.id DESC;
    `, [produtoId]);
    return aparelhos;
};


const deleteAvaliacao = async (id, usuarioId) => {
    const [result] = await connection.execute('DELETE FROM avaliacoes WHERE id=? AND usuario_id = ?', [id, usuarioId]);
    
    return result;
};

module.exports = {
    createAvaliacao,
    getProductAvaliacoes,
    deleteAvaliacao
};
