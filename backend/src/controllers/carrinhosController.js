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
        const results = await carrinhosModel.getCarrinhoByUser(req.usuario.id);

        const carrinhos = results.map(carrinho => ({
            ...carrinho,
            imagens: carrinho.imagens ? carrinho.imagens.split(',') : []
          })
        );

        return res.status(200).json(carrinhos);
    } catch (error) {
        console.error('Erro em getCarrinhoByUser:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getQtdCarrinhoUser = async (req, res) => {
    try {
        const result = await carrinhosModel.getQtdCarrinhoUser(req.usuario.id);

        return res.status(200).json(result);
    } catch (error) {
        console.log('Erro em getQtdCarrinhoUser:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const deleteCarrinhoById = async (req, res) => {
    try {
        const { id } = req.params;
        await carrinhosModel.deleteCarrinhoById(id);

        return res.status(200).json({ message: 'Carrinho deletado com sucesso' });
    } catch (error) {
        console.log('Erro no deleteCarrinho:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const limparCarrinhoUser = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        await carrinhosModel.limpaCarrinhoUser(usuarioId);

        res.status(200).json({ message: 'Carrinho limpo com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao limpar o carrinho' });
    }
};


module.exports = {
    createCarrinho,
    getCarrinhoByUser,
    getQtdCarrinhoUser,
    deleteCarrinhoById,
    limparCarrinhoUser
};
