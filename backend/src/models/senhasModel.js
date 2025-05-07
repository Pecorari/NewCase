const connection = require('../database/connection');

const buscarUsuarioPorEmail = async (email) => {
  const [usuarios] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return usuarios[0];
};

const atualizarTokenVerificacao = async (email, token) => {
  await connection.execute('UPDATE usuarios SET token_verificacao = ? WHERE email = ?', [token, email]);
};

const buscarUsuarioPorToken = async (token) => {
  const [usuarios] = await connection.execute('SELECT * FROM usuarios WHERE token_verificacao = ?', [token]);
  return usuarios[0];
};

const atualizarSenha = async (id, senhaCriptografada) => {
  await connection.execute('UPDATE usuarios SET senha = ?, token_verificacao = NULL WHERE id = ?', [senhaCriptografada, id]);
};

module.exports = {
  buscarUsuarioPorEmail,
  atualizarTokenVerificacao,
  buscarUsuarioPorToken,
  atualizarSenha
};
