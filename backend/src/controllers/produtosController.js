const produtosModel = require('../models/produtosModel');

const createProduto = async (req, res) => {
    try {
        const produto = await produtosModel.createProduto(req.body);

        return res.status(200).json(produto);
    } catch (error) {
        console.log('Erro em createProduto:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const getAllProdutos = async (req, res) => {
    try {
        const results = await produtosModel.getAllProdutos();

        const produtos = results.map(produto => ({
            ...produto,
            imagens: produto.imagens ? produto.imagens.split(',') : []
          })
        );
          
        return res.status(200).json(produtos);
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
        console.log('Erro em getSearchHeader:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getFilteredProdutos = async (req, res) => {
    try {
        const filtros = {
            categoria: req.query.categoria,
            aparelho: req.query.aparelho ,
            preco_min: req.query.preco_min,
            preco_max: req.query.preco_max,
            cor: req.query.cor,
            avaliacao: req.query.avaliacao,
        };

        const results = await produtosModel.getFilteredProdutos(filtros);
        
        const produtos = results.map(produto => ({
            ...produto,
            imagens: produto.imagens ? produto.imagens.split(',') : []
        }));

        return res.status(200).json(produtos);
    } catch (error) {
        console.log('Erro em getFilteredProdutos:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const getUniqueProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await produtosModel.getUniqueProduto(id);

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

        return res.status(200).json(produto);
    } catch (error) {
        console.log('Erro em updateProduto:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
};

const deleteProduto = async (req, res) => {
    try {
        const { id } = req.params;
        
        await produtosModel.deleteProduto(id);

        return res.status(200).json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        console.log('Erro no deleteProduto:', error);
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
