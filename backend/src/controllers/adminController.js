const statsModel = require('../models/statsModel');

const getStats = async (req, res) => {
  try {
    const stats = await statsModel.getStats();
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

module.exports = {
  getStats,
};
