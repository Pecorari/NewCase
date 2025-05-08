const mysql = require('mysql2/promise');

require('dotenv').config();

const connection = async config => {
    return mysql.createPool({
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWD,
        database: process.env.MYSQL_NAME,
        socketPath: process.env.INSTANCE_UNIX_SOCKET,
        ...config,
    });
};

async function testConnection() {
    try {
        const pool = await connection();
        const connection = await pool.getConnection();
        console.log('Conexão com o MySQL estabelecida com sucesso!');
        connection.release();
    } catch (error) {
        console.error('Erro ao conectar com o MySQL:', error.message);
    }
}

testConnection();

module.exports = connection;
