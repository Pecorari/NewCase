const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
    user: process.env.MYSQL_USER_local,
    password: process.env.MYSQL_PASSWD_local,
    database: process.env.MYSQL_NAME_local,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    // host: process.env.MYSQL_HOST_local,
    port: 3306
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
