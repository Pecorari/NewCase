const connection = require('../database/connection');

const createCategoria = async (dataCategoria) => {
    const { nome } = dataCategoria;
    
    const [result] = await connection.execute('INSERT INTO categorias(nome) VALUES (?)',
        [nome]
    );

    const [aparelhoCriado] = await connection.execute('SELECT * FROM categorias WHERE id = ?', [result.insertId]);

    return aparelhoCriado[0];
};

const getAllCategorias = async () => {
    const [categorias] = await connection.execute('SELECT * FROM categorias');
    return categorias;
};

const deleteCategoria = async (id) => {
    const [result] = await connection.execute('DELETE FROM categorias WHERE id = ?', [id]);
    
    return result;
};

module.exports = {
    createCategoria,
    getAllCategorias,
    deleteCategoria
};
