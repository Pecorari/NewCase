const enderecosModel = require('../models/enderecosModel');

const createEndereco = async (req, res) => {
    try {
        const endereco = await enderecosModel.createEndereco(req.body, req.usuario.id);

        return res.status(200).json(endereco);
    } catch (error) {
        console.log('Erro em createEndereco:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getUserEnderecos = async (req, res) => {
    try {
        const enderecos = await enderecosModel.getUserEnderecos(req.usuario.id);

        return res.status(200).json(enderecos);
    } catch (error) {
        console.error('Erro em getUserEnderecos:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const updateEndereco = async (req, res) => {
    try {
        const { id } = req.params;

        const endereco = await enderecosModel.updateEndereco(req.body, req.usuario.id, id);

        return res.status(200).json(endereco);
    } catch (error) {
        console.log('Erro em updateEndereco:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const deleteEndereco = async (req, res) => {
    try {
        const { id } = req.params;
        await enderecosModel.deleteEndereco(id);

        return res.status(200).json({ message: 'Endereco deletado com sucesso' });
    } catch (error) {
        console.log('Erro no deleteEndereco:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};


module.exports = {
    createEndereco,
    getUserEnderecos,
    updateEndereco,
    deleteEndereco
};
