const connection = require('../database/connection');
const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

const verificarPermissao = (permissoesPermitidas) => {
  return (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario || !permissoesPermitidas.includes(usuario.tipo)) {
      return res.status(403).json({ mensagem: 'Permissão negada.' });
    }

    next();
  };
};

const verificarProprietario = (tabela, colunaUsuario) => {
  return async (req, res, next) => {
    const { id } = req.params;
    const idLogado = req.usuario.id;

    try {
      const [rows] = await connection.execute(`SELECT ${colunaUsuario} FROM ${tabela} WHERE id = ?`, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ mensagem: 'Recurso não encontrado.' });
      }

      if (rows[0][colunaUsuario] !== idLogado) {
        return res.status(403).json({ mensagem: 'Acesso negado.' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  };
};


module.exports = {
  autenticarToken,
  verificarPermissao,
  verificarProprietario
};
