const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWD,
        database: process.env.MYSQL_NAME,
        socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
        port: 3306,
});

async function testConnection() {
    try {
        const conn = await connection.getConnection();
        console.log('Conexão com o MySQL estabelecida com sucesso!');
        conn.release();
    } catch (error) {
        console.error('Erro ao conectar com o MySQL:', error.message);
    }
}

testConnection();

module.exports = connection;
