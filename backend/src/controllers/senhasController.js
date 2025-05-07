const crypto = require('crypto');
const bcrypt = require('bcrypt');
const senhasModel = require('../models/senhasModel');
const { enviarLinkRedefinicao } = require('../utils/RedefinirSenhaEmail');

const solicitarRedefinicao = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await senhasModel.buscarUsuarioPorEmail(email);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    const token = crypto.randomBytes(32).toString('hex');
    await senhasModel.atualizarTokenVerificacao(email, token);
    
    res.status(200).json({ mensagem: 'E-mail enviado com link para redefinição de senha.' });

    enviarLinkRedefinicao(email, token).catch(err => {
      console.error('Erro ao enviar e-mail de verificação:', err);
    });
  } catch (err) {
    console.error('Erro ao solicitar redefinição:', err);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
};

const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;

  try {
    const usuario = await senhasModel.buscarUsuarioPorToken(token);
    if (!usuario) return res.status(400).json({ mensagem: 'Token inválido ou expirado' });

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    await senhasModel.atualizarSenha(usuario.id, senhaCriptografada);

    res.status(200).json({ mensagem: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
};

module.exports = { solicitarRedefinicao, redefinirSenha };
