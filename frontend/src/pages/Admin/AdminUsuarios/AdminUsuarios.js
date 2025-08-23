import React, { useEffect, useState } from 'react';
import api from '../../../hooks/useApi';

import './AdminUsuarios.css';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosExibir, setUsuariosExibir] = useState([]);
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
    setForm({ [name]: value });
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
        <input className='input-admin-usuario' type="text" name="searchValue" placeholder="ID / Nome do usuario" value={form.searchValue} onChange={handleInputChange} />
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
            <span>Telefone</span>
            <span>Data de Nascimento</span>
            <span>Email</span>
            <span>Tipo</span>
            <span>Criado em</span>
          </div>
          {usuariosExibir.map((usuario) => (
            <div className="user-row" key={usuario.id}>
              <span>{usuario.id}</span>
              <span>{usuario.nome}</span>
              <span>{usuario.cpf}</span>
              <span>{usuario.telefone}</span>
              <span>{usuario.data_nasc}</span>
              <span>{usuario.email}</span>
              <span>{usuario.tipo}</span>
              <span>{new Date(usuario.criado_em).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
