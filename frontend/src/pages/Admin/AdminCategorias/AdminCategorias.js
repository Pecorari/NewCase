import React, { useEffect, useState } from 'react';

import api from '../../../hooks/useApi';

import './AdminCategorias.css';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    nome: ''
  });

  useEffect(() => {
    buscarCategorias();
  }, []);

  const buscarCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nome: form.nome,
      };

      await api.post('/categorias/add', payload);

      setForm({nome: ''});
      buscarCategorias();
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao adicionar categoria:', err);
    }
  };

  const handleDeletar = async (id) => {
    try {
      await api.delete(`/categorias/del/${id}`);
      buscarCategorias();
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao deletar categoria:', err);
    }
  };

  return (
    <div className='admin-container'>
      {erro ? <span className='erro'>{erro}</span> : <></>}
      <h2 className='title-admin-categoria'>Nova Categoria</h2>
      <form className='form-admin-categoria' onSubmit={handleSubmit}>
        <input className='input-admin-categoria' type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleInputChange} required />
        <button className='form-btn-admin-categoria' type="submit">Adicionar</button>
      </form>

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-categoria'>Lista de Categorias</h2>
      {categorias.length === 0 ? (
        <p>Nenhuma categoria cadastrado.</p>
      ) : (
        <ul className='ul-admin-categoria'>
          {categorias.map((categoria) => (
            <li className='li-admin-categoria' key={categoria.id}>
              <div className='dados-categorias'>
                <p>{categoria.id}</p>
                <div className='nome-categoria'>
                  <p>{categoria.nome}</p>
                </div>
              </div>
              <button className='li-btn-admin-categoria' onClick={() => handleDeletar(categoria.id)}>Deletar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminCategorias;
