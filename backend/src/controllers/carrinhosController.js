const carrinhosModel = require('../models/carrinhosModel');

const createCarrinho = async (req, res) => {
    try {
        const carrinho = await carrinhosModel.createCarrinho(req.body, req.usuario.id);

        return res.status(200).json(carrinho);
    } catch (error) {
        console.log('Erro em createCarrinho:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getCarrinhoByUser = async (req, res) => {
    try {
        const carrinhos = await carrinhosModel.getCarrinhoByUser(req.usuario.id);

        return res.status(200).json(carrinhos);
    } catch (error) {
        console.error('Erro em getCarrinhoByUser:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const deleteCarrinho = async (req, res) => {
    try {
        const { id } = req.params;
        await carrinhosModel.deleteCarrinho(id);

        return res.status(200).json({ message: 'Carrinho deletado com sucesso' });
    } catch (error) {
        console.log('Erro no deleteCarrinho:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};


module.exports = {
    createCarrinho,
    getCarrinhoByUser,
    deleteCarrinho
};
