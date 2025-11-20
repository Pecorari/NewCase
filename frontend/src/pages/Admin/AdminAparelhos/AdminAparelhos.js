import React, { useEffect, useState } from 'react';

import api from '../../../hooks/useApi';

import './AdminAparelhos.css';

const AdminAparelhos = () => {
  const [aparelhos, setAparelhos] = useState([]);
  const [erro, setErro] = useState('');
  const [formSearch, setFormSearch] = useState('');
  const [form, setForm] = useState({
    nome: ''
  });

  useEffect(() => {
    buscarAparelhos();
  }, []);

  const buscarAparelhos = async () => {
    try {
      const response = await api.get('/aparelhos');
      setAparelhos(response.data);
      setErro('');
      setFormSearch('');
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar aparelhos:', err);
    }
  };


  const handleInputSearchChange = (e) => {
    setFormSearch(e.target.value);
  };

  const searchAparelhos = async (e) => {
    e.preventDefault();
    
    if (formSearch.length < 2) {
      setErro("Digite pelo menos 2 caracteres para buscar.");
      return;
    }

    try {
      const response = await api.get(`/aparelhos/search?busca=${formSearch}`);
      setAparelhos(response.data);
      setErro('');
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao buscar aparelhos");
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

      await api.post('/aparelhos/add', payload);

      setForm({nome: ''});
      buscarAparelhos();
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao adicionar aparelho:', err);
    }
  };

  const handleDeletar = async (id) => {
    try {
      await api.delete(`/aparelhos/del/${id}`);
      buscarAparelhos();
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao deletar aparelho:', err);
    }
  };

  return (
    <div className='admin-container'>
      {erro ? <span className='erro'>{erro}</span> : <></>}
      <h2 className='title-admin-aparelho'>Novo Aparelho</h2>
      <form className='form-admin-aparelho' onSubmit={handleSubmit}>
        <input className='input-admin-aparelho' type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleInputChange} required />
        <button className='form-btn-admin-aparelho' type="submit">Adicionar</button>
      </form>

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-aparelho'>Lista de Aparelhos</h2>

      <form className='form-admin-search-aparelho' onSubmit={searchAparelhos}>
        <input className='input-admin-search-aparelho' type="text" placeholder="ID ou Nome" value={formSearch} onChange={handleInputSearchChange} />
        <button className='form-btn-admin-search-aparelho' type="submit">Pesquisar</button>
        <button type="button" onClick={buscarAparelhos}>Limpar</button>
      </form>

      {aparelhos.length === 0 ? (
        <p>Nenhum aparelho cadastrado.</p>
      ) : (
      <>
        <div className="aparelho-grid desktop-only">
          <div className="aparelho-header">
            <span>ID</span>
            <span>Nome</span>
            <span>Ações</span>
          </div>

          {aparelhos.map((aparelho) => (
            <div className="aparelho-row" key={aparelho.id}>
              <span>{aparelho.id}</span>
              <span>{aparelho.nome}</span>
              <button className='btn-dell-aparelho' onClick={() => handleDeletar(aparelho.id)}>Deletar</button>
            </div>
          ))}
        </div>

        <div className="aparelhos-lista mobile-only">
          {aparelhos.map((aparelho) => (
            <div key={aparelho.id} className="aparelho-card">
              <span><strong>ID:</strong> {aparelho.id}</span>
              <span><strong>Nome:</strong> {aparelho.nome}</span>
              <button onClick={() => handleDeletar(aparelho.id)} className="btn-dell-aparelho">
                Deletar
              </button>
            </div>
          ))}
        </div>
      </>
      )}
    </div>
  );
};

export default AdminAparelhos;
