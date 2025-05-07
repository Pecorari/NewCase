const connection = require('../database/connection');

const createAparelho = async (dataAparelho) => {
    const { nome } = dataAparelho;
    
    const [result] = await connection.execute('INSERT INTO aparelhos(nome) VALUES (?)',
        [nome]
    );

    const [aparelhoCriado] = await connection.execute('SELECT * FROM aparelhos WHERE id = ?', [result.insertId]);

    return aparelhoCriado[0];
};

const getAllAparelhos = async () => {
    const [aparelhos] = await connection.execute('SELECT * FROM aparelhos');
    return aparelhos;
};

const getSearchAparelhos = async (busca) => {
    const [aparelhos] = await connection.execute('SELECT * FROM aparelhos WHERE nome LIKE ? LIMIT 10', [busca]);
    return aparelhos;
};


const deleteAparelho = async (id) => {
    const [result] = await connection.execute('DELETE FROM aparelhos WHERE id = ?', [id]);
    
    return result;
};

module.exports = {
    createAparelho,
    getAllAparelhos,
    getSearchAparelhos,
    deleteAparelho
};
