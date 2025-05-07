const categoriasModel = require('../models/categoriasModel');

const createCategoria = async (req, res) => {
    try {
        const categoria = await categoriasModel.createCategoria(req.body);

        return res.status(200).json(categoria);
    } catch (error) {
        console.log('Erro em createCategoria:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getAllCategorias = async (req, res) => {
    try {
        const categorias = await categoriasModel.getAllCategorias();

        return res.status(200).json(categorias);
    } catch (error) {
        console.error('Erro em getAllCategorias:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await categoriasModel.deleteCategoria(id);

        return res.status(200).json({ message: 'Categorias deletado com sucesso' });
    } catch (error) {
        console.log('Erro no deleteCategoria:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};


module.exports = {
    createCategoria,
    getAllCategorias,
    deleteCategoria
};
