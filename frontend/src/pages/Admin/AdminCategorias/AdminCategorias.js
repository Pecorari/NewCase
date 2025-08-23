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
        <p>Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="categoria-grid">
          <div className="categoria-header">
            <span>ID</span>
            <span>Nome</span>
            <span>Ações</span>
          </div>
          {categorias.map((categoria) => (
            <div className="categoria-row" key={categoria.id}>
              <span>{categoria.id}</span>
              <span>{categoria.nome}</span>
              <button className='btn-dell-categoria' onClick={() => handleDeletar(categoria.id)}>Deletar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategorias;
