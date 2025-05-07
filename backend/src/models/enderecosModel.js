const connection = require('../database/connection');

const createEndereco = async (dataEndereco, idLogado) => {
    const { cep, rua, numero, complemento, bairro, cidade, estado } = dataEndereco;
    
    const [result] = await connection.execute('INSERT INTO enderecos(usuario_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [idLogado, cep, rua, numero, complemento, bairro, cidade, estado]
    );

    const [enderecoCriado] = await connection.execute('SELECT * FROM enderecos WHERE id = ?', [result.insertId]);

    return enderecoCriado[0];
};

const getUserEnderecos = async (idLogado) => {
    const [enderecos] = await connection.execute('SELECT * FROM enderecos WHERE usuario_id = ?', [idLogado]);
    return enderecos;
};

const updateEndereco = async (dataEndereco, idLogado, id) => {
    const { cep, rua, numero, complemento, bairro, cidade, estado } = dataEndereco;

    await connection.execute('UPDATE enderecos SET usuario_id=?, cep=?, rua=?, numero=?, complemento=?, bairro=?, cidade=?, estado=? WHERE id = ?',
        [idLogado, cep, rua, numero, complemento, bairro, cidade, estado, id]
    );

    const [enderecoAtualizado] = await connection.execute('SELECT * FROM enderecos WHERE id = ?', [id]);

    return enderecoAtualizado[0];
};

const deleteEndereco = async (id) => {
    const [result] = await connection.execute('DELETE FROM enderecos WHERE id = ?', [id]);
    
    return result;
};

module.exports = {
    createEndereco,
    getUserEnderecos,
    updateEndereco,
    deleteEndereco
};
