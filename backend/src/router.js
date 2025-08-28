const express = require('express');

const produtosController = require('./controllers/produtosController');
const avaliacoesController = require('./controllers/avaliacoesController');
const aparelhosController = require('./controllers/aparelhosController');
const categoriasController = require('./controllers/categoriasController');
const carrinhosController = require('./controllers/carrinhosController');
const enderecosController = require('./controllers/enderecosController');
const pedidosController = require('./controllers/pedidosController');
const usuariosController = require('./controllers/usuariosController');
const senhaController = require('./controllers/senhasController');
const checkoutController = require('./controllers/checkoutController');

const adminController = require('./controllers/adminController');

const { validarProduto } = require('./middlewares/produtosMiddleware');
const { validarAparelho } = require('./middlewares/aparelhosMiddleware');
const { validarCategoria } = require('./middlewares/categoriasMiddleware');
const { validarCarrinho } = require('./middlewares/carrinhosMiddleware');
const { validarEndereco } = require('./middlewares/enderecosMiddleware');
const { validarPedido } = require('./middlewares/pedidosMiddleware');
const { validarUsuario, validarEditUsuario, validarLogin, validarSenha } = require('./middlewares/usuariosMiddleware');
const { validarRequisicao, validarId } = require('./middlewares/globalMiddleware');
const { autenticarToken, verificarPermissao, verificarProprietario } = require('./middlewares/authMiddleware');

const  { enviarContatoEmail } = require('./utils/contatoEmail');
const freteController = require('./controllers/freteController');

const router = express.Router();

router.post('/contato-email', async (req, res) => {
  const { nome, email, mensagem } = req.body;
  enviarContatoEmail(nome, email, mensagem).then(() => {
    return res.status(200).json({ message: 'E-mail enviado com sucesso.' });
  }).catch(err => {
    return console.error('Erro ao enviar o e-mail de contato:', err);
  });
});

router.get('/oauth/callback', freteController.obterToken);
router.post('/calcular-frete', freteController.calcularFrete);

router.post('/produtos/add', autenticarToken, verificarPermissao(['admin']), validarProduto, validarRequisicao, produtosController.createProduto);
router.get('/produtos', produtosController.getAllProdutos);
router.get('/produtos/destaques', produtosController.getProdutosDestaque);
router.get('/produtos/search', produtosController.getSearchHeader);
router.get('/produtos/filters', produtosController.getFilteredProdutos);
router.get('/produtos/:id', produtosController.getUniqueProduto);
router.put('/produtos/edit/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarProduto, validarRequisicao, produtosController.updateProduto);
router.delete('/produtos/del/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarRequisicao, produtosController.deleteProduto);

router.post('/avaliacoes/add', autenticarToken, verificarPermissao(['admin', 'cliente']), avaliacoesController.createAvaliacao);
router.get('/avaliacoes/:produtoId', avaliacoesController.getProductAvaliacoes);
router.delete('/avaliacoes/del/:id', autenticarToken, verificarPermissao(['admin', 'cliente']), avaliacoesController.deleteAvaliacao);

router.post('/aparelhos/add', autenticarToken, verificarPermissao(['admin']), validarAparelho, validarRequisicao, aparelhosController.createAparelho);
router.get('/aparelhos', aparelhosController.getAllAparelhos);
router.get('/aparelhos/search', aparelhosController.getSearchAparelhos);
router.delete('/aparelhos/del/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarRequisicao, aparelhosController.deleteAparelho);

router.post('/categorias/add', autenticarToken, verificarPermissao(['admin']), validarCategoria, validarRequisicao, categoriasController.createCategoria);
router.get('/categorias', categoriasController.getAllCategorias);
router.delete('/categorias/del/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarRequisicao, categoriasController.deleteCategoria);

router.get('/profile', autenticarToken, usuariosController.profile);

// INTEGRAÇAO CHECKOUT PAGBANK
router.post('/checkout/sessao', checkoutController.createSession);
router.post('/checkout/pagar', checkoutController.pagamento);
router.post('/checkout/notificacao', checkoutController.notificacao);


// Rotas para manipular apenas os próprios dados. ex.: Editar apenas o próprio pedido

router.post('/carrinho/add', autenticarToken, verificarPermissao(['admin', 'cliente']), validarCarrinho, validarRequisicao, carrinhosController.createCarrinho);
router.get('/carrinho', autenticarToken, verificarPermissao(['admin', 'cliente']), carrinhosController.getCarrinhoByUser);
router.get('/carrinhoQtd', autenticarToken, verificarPermissao(['admin', 'cliente']), carrinhosController.getQtdCarrinhoUser);
router.delete('/carrinho/del/:id', autenticarToken, verificarPermissao(['admin', 'cliente']), verificarProprietario('carrinho', 'usuario_id'), validarId, validarRequisicao, carrinhosController.deleteCarrinhoById);
router.delete('/carrinho/limpar', autenticarToken, verificarPermissao(['admin', 'cliente']), validarRequisicao, carrinhosController.limparCarrinhoUser);

router.post('/enderecos/add', autenticarToken, verificarPermissao(['admin', 'cliente']), validarEndereco, validarRequisicao, enderecosController.createEndereco);
router.get('/enderecos', autenticarToken, verificarPermissao(['admin', 'cliente']), enderecosController.getUserEnderecos);
router.put('/enderecos/edit/:id', autenticarToken, verificarPermissao(['admin', 'cliente']), verificarProprietario('enderecos', 'usuario_id'), validarId, validarEndereco, validarRequisicao, enderecosController.updateEndereco);
router.delete('/enderecos/del/:id', autenticarToken, verificarPermissao(['admin', 'cliente']), verificarProprietario('enderecos', 'usuario_id'), validarId, validarRequisicao, enderecosController.deleteEndereco);

router.post('/pedidos/add', autenticarToken, verificarPermissao(['admin', 'cliente']), validarPedido, validarRequisicao, pedidosController.createPedido);
router.get('/pedidos', autenticarToken, verificarPermissao(['admin', 'cliente']), pedidosController.getAllMyPedidos);
router.get('/pedidos/:id', autenticarToken, verificarPermissao(['admin', 'cliente']), pedidosController.getUniquePedido);
router.put('/pedidos/cancel/:id', autenticarToken, verificarPermissao(['admin', 'cliente']), verificarProprietario('pedidos', 'usuario_id'), validarId, validarRequisicao, pedidosController.cancelarPedido);

router.post('/usuarios/add', validarUsuario, validarRequisicao, usuariosController.createUsuario);
router.get('/confirmar-email', usuariosController.confirmarEmail);
router.post('/reenviar-email', usuariosController.reenviarEmail);
router.post('/usuarios/login', validarLogin, validarRequisicao, usuariosController.loginUsuario);
router.post('/usuarios/logout', usuariosController.logout);
router.put('/usuarios/edit', autenticarToken, verificarPermissao(['admin', 'cliente']), validarEditUsuario, validarRequisicao, usuariosController.updateUsuario);
router.put('/usuarios/alterar-senha', autenticarToken, verificarPermissao(['admin', 'cliente']), validarSenha, validarRequisicao, usuariosController.alterarSenha);
router.delete('/usuarios/del/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarRequisicao, usuariosController.deleteUsuario);
router.post('/esqueci-senha', senhaController.solicitarRedefinicao);
router.post('/redefinir-senha', validarSenha, validarRequisicao, senhaController.redefinirSenha);

// Rotas para mexer com dados de GERAL. ex.: Listar Pedidos de geral

router.get('/pedidosAdmin', autenticarToken, verificarPermissao(['admin']), pedidosController.getAdminPedidos);
router.get('/pedidosAdmin/search/:value', autenticarToken, verificarPermissao(['admin']), validarRequisicao, pedidosController.getAdminPedidoBySearch);
router.put('/pedidosAdmin/edit/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarPedido, validarRequisicao, pedidosController.updateAdminPedido);
router.delete('/pedidosAdmin/del/:id', autenticarToken, verificarPermissao(['admin']), validarId, validarRequisicao, pedidosController.deletePedido);

router.get('/usuarios', autenticarToken, verificarPermissao(['admin']), usuariosController.getAllUsuarios);
router.get('/usuarios/:value', autenticarToken, verificarPermissao(['admin']), validarRequisicao, usuariosController.getUsuarioBySearch);

router.get('/statsAdmin', adminController.getStats);

module.exports = router;
