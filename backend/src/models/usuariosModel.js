const connection = require('../database/connection');

const createUsuario = async (dataUser) => {
  const { nome, cpf, telefone, data_nasc, email, senha, tokenVerificacao, tipo } = dataUser;

  const [result] = await connection.execute(
    `INSERT INTO usuarios (nome, cpf, telefone, data_nasc, email, senha, email_verificado, token_verificacao, tipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, cpf, telefone, data_nasc, email, senha, false, tokenVerificacao, tipo]
  );

  const [usuarioCriado] = await connection.execute('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);

  return usuarioCriado[0];
};

const confirmarEmail = async (token) => {
  const [usuarios] = await connection.execute(
    'SELECT * FROM usuarios WHERE token_verificacao = ? AND email_verificado = 0',
    [token]
  );

  if (usuarios.length === 0) return null;

  const usuario = usuarios[0];

  await connection.execute(
    'UPDATE usuarios SET email_verificado = 1, token_verificacao = NULL WHERE id = ?',
    [usuario.id]
  );

  return usuario;
};

const loginUsuario = async (email) => {
  const [usuario] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

  return usuario[0];
};

const getAllUsuarios = async () => {
  const [usuarios] = await connection.execute('SELECT * FROM usuarios');

  return usuarios;
};

const getUsuarioBySearch = async (value) => {
  const [usuario] = await connection.execute(`SELECT * FROM usuarios WHERE id = ? OR LOWER(nome) LIKE CONCAT('%', LOWER(?), '%')`, [value, value]);

  return usuario[0];
};

const updateUsuario = async (dataUser, idLogado) => {
  const { nome, cpf, telefone, data_nasc } = dataUser;

  await connection.execute(`UPDATE usuarios SET nome = ?, cpf = ?, telefone = ?, data_nasc = ? WHERE id = ?`,
    [nome, cpf, telefone, data_nasc, idLogado]
  );

  const [usuarioAtualizado] = await connection.execute('SELECT * FROM usuarios WHERE id = ?', [idLogado]);

  return usuarioAtualizado[0];
};

const alterarSenha = async (novaSenhaHash, idLogado) => {
  await connection.execute(`UPDATE usuarios SET senha = ? WHERE id = ?`, [novaSenhaHash, idLogado]);

  return;
};

const deleteUsuario = async (id) => {
  const [result] = await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);

  return result;
};

module.exports = {
  createUsuario,
  confirmarEmail,
  loginUsuario,
  getAllUsuarios,
  getUsuarioBySearch,
  updateUsuario,
  alterarSenha,
  deleteUsuario
};
