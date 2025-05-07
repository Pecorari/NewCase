const aparelhosModel = require('../models/aparelhosModel');

const createAparelho = async (req, res) => {
    try {
        const aparelho = await aparelhosModel.createAparelho(req.body);

        return res.status(200).json(aparelho);
    } catch (error) {
        console.log('Erro em createAparelho:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getAllAparelhos = async (req, res) => {
    try {
        const aparelhos = await aparelhosModel.getAllAparelhos();

        return res.status(200).json(aparelhos);
    } catch (error) {
        console.error('Erro em getAllAparelhos:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getSearchAparelhos = async (req, res) => {
    const { busca } = req.query;

    if (!busca || busca.length < 2) {
      return res.status(400).json({ error: 'É necessário fornecer pelo menos 2 caracteres para busca.' });
    }
  
    try {
      const aparelhos = await aparelhosModel.getSearchAparelhos(busca);

      return res.status(200).json(aparelhos);
    } catch (error) {
      console.error('Erro em getSearchAparelhos:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const deleteAparelho = async (req, res) => {
    try {
        const { id } = req.params;
        await aparelhosModel.deleteAparelho(id);

        return res.status(200).json({ message: 'Aparelho deletado com sucesso' });
    } catch (error) {
        console.log('Erro no deleteAparelho:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};


module.exports = {
    createAparelho,
    getAllAparelhos,
    getSearchAparelhos,
    deleteAparelho
};
