import React, { useEffect, useState } from 'react';

import api from '../../../hooks/useApi';

import './AdminUsuarios.css';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    usuario_id: ''
  });

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const buscarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
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
    
    if (form.usuario_id.trim() === '') {
      buscarUsuarios();
      setUsuario([]);
      return;
    }

    try {
      const response = await api.get(`/usuarios/${form.usuario_id}`);

      setForm({usuario_id: ''});
      setUsuario(response.data);
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
        <input className='input-admin-usuario' type="text" name="usuario_id" placeholder="Usuario ID" value={form.usuario_id} onChange={handleInputChange} />
        <button className='form-btn-admin-usuario' type="submit">Buscar</button>
      </form>

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-usuario'>Lista de usuarios</h2>
      {usuarios.length === 0 ? (
        <p>Nenhum usuario feito.</p>
      ) : (
        <ul className='ul-admin-usuario'>
          {usuario.length !== 0  ? (
          <li className='li-admin-usuario'>
              <div className='dados-usuarios'>
                <p>{usuario.id}</p>
                <p>{usuario.nome}</p>
                <p>{usuario.cpf}</p>
                <p>{usuario.telefone}</p>
                <p>{usuario.data_nasc}</p>
                <p>{usuario.email}</p>
                <p>{usuario.tipo}</p>
                <p>{usuario.criado_em}</p>
              </div>
            </li> ) : usuarios.map((user) => (
            <li className='li-admin-usuario' key={user.id}>
              <div className='dados-usuarios'>
                <p>{user.id}</p>
                <p>{user.nome}</p>
                <p>{user.cpf}</p>
                <p>{user.telefone}</p>
                <p>{user.data_nasc}</p>
                <p>{user.email}</p>
                <p>{user.tipo}</p>
                <p>{user.criado_em}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminUsuarios;
