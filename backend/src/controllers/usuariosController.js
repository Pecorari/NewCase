const usuarioModel = require('../models/usuariosModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const  { enviarEmailVerificacao } = require('../utils/confirmEmail');
const { salvarData, exibirData } = require('../utils/formatarDatas');

const createUsuario = async (req, res) => {
  try {
    const { nome, cpf, telefone, data_nasc, email, senha, tipo = 'cliente' } = req.body;
    
    const dataFormatada = salvarData(data_nasc);
    const hashedSenha = await bcrypt.hash(senha, 10);
    const tokenVerificacao = uuidv4();

    const usuario = await usuarioModel.createUsuario({ nome, cpf, telefone, data_nasc: dataFormatada, email, senha: hashedSenha, tokenVerificacao, tipo });
    
    res.status(201).json({
      mensagem: 'Usuário criado com sucesso. Verifique seu e-mail para confirmar o cadastro.',
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    });


    enviarEmailVerificacao(email, tokenVerificacao).catch(err => {
      console.error('Erro ao enviar e-mail de verificação:', err);
    });
  } catch (error) {
    console.error('Erro no createUsuario:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const confirmarEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ mensagem: 'Token de verificação não fornecido.' });
  }

  try {
    const usuario = await usuarioModel.confirmarEmail(token);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Token inválido ou já utilizado.' });
    }

    const jwtToken = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({
      mensagem: 'E-mail confirmado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro ao confirmar e-mail:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const reenviarEmail = async (req, res) => {
  const { id, email } = req.body;

  try {
    const usuario = await usuarioModel.getUsuarioById(id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    if (usuario.email_verificado) {
      return res.status(400).json({ mensagem: 'E-mail já confirmado.' });
    }

    const token = usuario.token_verificacao;

    await enviarEmailVerificacao(email, token);

    res.status(200).json({ message: 'E-mail reenviado com sucesso' });
  } catch (error) {
    console.error('Erro ao confirmar e-mail:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await usuarioModel.loginUsuario(email);

    if (!usuario || usuario.length === 0) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidas.' });
    }
    
    const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
  } catch (error) {
    console.error('Erro no loginUsuario:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};
const logout = async (req, res) => {
  try {    
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    return res.status(200).json({ message: 'Logout efetuado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.getAllUsuarios();

    const usuariosFormatados = usuarios.map(usuario => ({
      ...usuario,
      data_nasc: exibirData(usuario.data_nasc),
    }));

    return res.status(200).json(usuariosFormatados);
  } catch (error) {
    console.error('Erro em getAllUsuarios:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const getUsuarioBySearch = async (req, res) => {
  try {
    const { value } = req.params;
    
    const usuario = await usuarioModel.getUsuarioBySearch(value);
    
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    usuario.data_nasc = exibirData(usuario.data_nasc);

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro em getUsuarioBySearch:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const profile = async (req, res) => {
  try {
    const user = await usuarioModel.getUsuarioBySearch(req.usuario.id);
    if (!user) return res.status(404).json({ message: 'Usúario não encontrado' });
    const { senha, ...usuario } = user;
    res.json(usuario);
  } catch (error) {
    console.error('Erro em profile:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { nome, cpf, telefone, data_nasc } = req.body;

    const dataFormatada = salvarData(data_nasc);

    const usuarioAtualizado = await usuarioModel.updateUsuario({ nome, cpf, telefone, data_nasc: dataFormatada }, req.usuario.id);
    usuarioAtualizado.data_nasc = exibirData(usuarioAtualizado.data_nasc);
    
    return res.status(200).json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro no updateUsuario:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const alterarSenha = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  try {
    const usuario = await usuarioModel.getUsuarioById(req.usuario.id);

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) return res.status(400).json({ errors: "Senha atual incorreta." });

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await usuarioModel.alterarSenha(novaSenhaHash, req.usuario.id);

    return res.status(200).json({ mensagem: "Senha alterada com sucesso!" }, );
  } catch (err) {
    console.error('Erro no alterarSenha:', err);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    await usuarioModel.deleteUsuario(id);

    return res.status(200).json({ message: 'Usuario deletado com sucesso' });
  } catch (error) {
    console.error('Erro em deleteUsuario:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

module.exports = {
  createUsuario,
  confirmarEmail,
  reenviarEmail,
  loginUsuario,
  logout,
  getAllUsuarios,
  getUsuarioBySearch,
  profile,
  updateUsuario,
  alterarSenha,
  deleteUsuario,
};
