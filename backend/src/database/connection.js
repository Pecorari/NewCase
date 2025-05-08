const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = async config => {
    return mysql.connection({
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWD,
        database: process.env.MYSQL_NAME,
        host: process.env.MYSQL_HOST,
        port: 3306,
        ...config,
    });
};

async function testConnection() {
    try {
        const pool = await connection();
        const conn = await pool.getConnection();
        console.log('Conexão com o MySQL estabelecida com sucesso!');
        conn.release();
    } catch (error) {
        console.error('Erro ao conectar com o MySQL:', error.message);
    }
}

testConnection();

module.exports = connection;
