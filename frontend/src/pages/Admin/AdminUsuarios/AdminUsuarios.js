import React, { useEffect, useState } from 'react';
import api from '../../../hooks/useApi';

import './AdminUsuarios.css';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosExibir, setUsuariosExibir] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    searchValue: ''
  });

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const buscarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuariosExibir(response.data); 
      setUsuarios(response.data);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar usuarios:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.searchValue.trim() === '') {
      setUsuariosExibir(usuarios); 
      return;
    }

    try {
      const response = await api.get(`/usuarios/${form.searchValue}`);
      setUsuariosExibir([response.data]);
      setForm({searchValue: ''});
      setErro('');
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar usuario:', err);
    }
  };

  return (
    <div className='admin-container'>
      {erro ? <span className='erro'>{erro}</span> : <></>}
      <h2 className='title-admin-usuario'>Buscar Usuario</h2>
      <form className='form-admin-usuario' onSubmit={handleSubmit}>
        <input 
          className='input-admin-usuario'
          type="text"
          name="searchValue"
          placeholder="ID / Nome do usuario"
          value={form.searchValue}
          onChange={handleInputChange}
        />
        <button className='form-btn-admin-usuario' type="submit">Buscar</button>
      </form>

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-usuario'>Lista de usuarios</h2>
      {usuariosExibir.length === 0 ? (
        <p>Nenhum usuario feito.</p>
      ) : (
        <div className="user-grid">
          <div className="user-header">
            <span>ID</span>
            <span>Nome</span>
            <span>CPF</span>
          </div>
          {usuariosExibir.map((usuario) => (
            <div className="user-row" key={usuario.id} onClick={() => setUsuarioSelecionado(usuario)}>
              <span data-label="ID">{usuario.id}</span>
              <span data-label="Nome">{usuario.nome}</span>
              <span data-label="CPF">{usuario.cpf}</span>
            </div>
          ))}
        </div>
      )}

      {usuarioSelecionado && (
        <div className="modal-adm">
          <div className="modal-content-adm">
            <button className="close-modal-adminPedidos" onClick={() => setUsuarioSelecionado(null)}>X</button>
            <h2>Usuario #{usuarioSelecionado.id}</h2>

            <div className="modal-grid-adm">
              <section>
                <h3 className="subtitles-sections-adm">Informações Gerais</h3>
                <p>Nome: {usuarioSelecionado.nome}</p>
                <p>CPF: {usuarioSelecionado.cpf}</p>
                <p>Telefone: {usuarioSelecionado.telefone}</p>
                <p>E-mail: {usuarioSelecionado.email}</p>
                <p>Datra de Nascimento: {usuarioSelecionado.data_nasc}</p>
                <br/><br/>
                <p>Tipo: {usuarioSelecionado.tipo}</p>
                <p>Email Verificado: {usuarioSelecionado.email_verificado === 1 ? 'Sim' : 'Não'}</p>
                <p>Criado em: {new Date(usuarioSelecionado.criado_em).toLocaleString()}</p>
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsuarios;
