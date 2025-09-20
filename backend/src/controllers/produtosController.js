const produtosModel = require('../models/produtosModel');

const createProduto = async (req, res) => {
    try {
        const produto = await produtosModel.createProduto(req.body);

        return res.status(201).json(produto);
    } catch (error) {
        console.error('Erro em createProduto:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getAllProdutos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;

        const { produtos, total } = await produtosModel.getAllProdutos(page, limit);

        const totalPaginas = Math.ceil(total / limit);

        return res.status(200).json({ produtos, total, totalPaginas, page });
    } catch (error) {
        console.error('Erro em getAllProdutos:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getProdutosDestaque = async (req, res) => {
    try {
        const results = await produtosModel.getProdutosDestaque();

        const produtos = results.map(produto => ({
            ...produto,
            imagens: produto.imagens ? produto.imagens.split(',') : []
        }));

        return res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro em getProdutosDestaque:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getSearchHeader = async (req, res) => {
    const { busca } = req.query;
    
    if (!busca || busca.length < 2) {
      return res.status(400).json({ error: 'É necessário fornecer pelo menos 2 caracteres para busca.' });
    }

    try {
        const produtos = await produtosModel.getSearchHeader(busca);
        
        return res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro em getSearchHeader:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getFilteredProdutos = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;

    try {
        const filtros = {
            categoria: req.query.categoria || null,
            aparelho: req.query.aparelho || null,
            preco_min: req.query.preco_min ? Number(req.query.preco_min) : null,
            preco_max: req.query.preco_max ? Number(req.query.preco_max) : null,
            cor: req.query.cor || null,
            avaliacao: req.query.avaliacao ? Number(req.query.avaliacao) : null,
        };

        const { produtos: results, total } = await produtosModel.getFilteredProdutos(filtros, page, limit);

        const produtos = results.map(produto => ({
            ...produto,
            imagens: produto.imagens ? produto.imagens.split(',') : []
        }));

        const totalPaginas = Math.ceil(total / limit);
        return res.status(200).json({ produtos, total, totalPaginas, page });
    } catch (error) {
        console.error('Erro em getFilteredProdutos:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getUniqueProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await produtosModel.getUniqueProduto(id);

        if (!result) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const produto = {
            ...result,
            imagens: result.imagens ? result.imagens.split(',') : []
        };

        return res.status(200).json(produto);
    } catch (error) {
        console.error('Erro em getUniqueProduto:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const updateProduto = async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await produtosModel.updateProduto(req.body, id);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        return res.status(200).json(produto);
    } catch (error) {
        console.error('Erro em updateProduto:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const deleteProduto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await produtosModel.deleteProduto(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        return res.status(200).json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        console.error('Erro no deleteProduto:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};


module.exports = {
    createProduto,
    getAllProdutos,
    getProdutosDestaque,
    getSearchHeader,
    getFilteredProdutos,
    getUniqueProduto,
    updateProduto,
    deleteProduto
};
