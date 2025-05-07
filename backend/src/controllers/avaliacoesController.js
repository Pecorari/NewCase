const avaliacoesModel = require('../models/avaliacoesModel');

const createAvaliacao = async (req, res) => {
    try {
        const avaliacao = await avaliacoesModel.createAvaliacao(req.body, req.usuario.id);

        return res.status(200).json(avaliacao);
    } catch (error) {
        console.log('Erro em createAvaliacao:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getProductAvaliacoes = async (req, res) => {
    try {
        const { produtoId } = req.params;
        const avaliacoes = await avaliacoesModel.getProductAvaliacoes(produtoId);

        return res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro em getProductAvaliacoes:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const deleteAvaliacao = async (req, res) => {
    try {
        const { id } = req.params;
        await avaliacoesModel.deleteAvaliacao(id, req.usuario.id);

        return res.status(200).json({ message: 'Avaliação deletada com sucesso' });
    } catch (error) {
        console.log('Erro no deleteAvaliacao:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};


module.exports = {
  createAvaliacao,
  getProductAvaliacoes,
  deleteAvaliacao
};
