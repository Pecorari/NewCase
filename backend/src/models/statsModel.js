const connection = require('../database/connection');

const getStats = async () => {
  try {
    const [rows] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios) AS usuarios,
        (SELECT COUNT(*) FROM produtos) AS produtos,
        (SELECT COUNT(*) FROM pedidos) AS pedidos,
        (SELECT COUNT(*) FROM aparelhos) AS aparelhos
    `);

    return rows[0];
  } catch (error) {
    console.error('Erro no statsModel:', error);
    throw error;
  }
};

module.exports = {
  getStats,
};
