import React, { useEffect, useState } from 'react';

import api from '../../../hooks/useApi';

import './AdminAparelhos.css';

const AdminAparelhos = () => {
  const [aparelhos, setAparelhos] = useState([]);
  const [erro, setErro] = useState('');
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
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar aparelhos:', err);
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
      {aparelhos.length === 0 ? (
        <p>Nenhum aparelho cadastrado.</p>
      ) : (
        <ul className='ul-admin-aparelho'>
          {aparelhos.map((aparelho) => (
            <li className='li-admin-aparelho' key={aparelho.id}>
              <div className='dados-aparelhos'>
                <p>{aparelho.id}</p>
                <div className='nome-aparelho'>
                  <p>{aparelho.nome}</p>
                </div>
              </div>
              <button className='li-btn-admin-aparelho' onClick={() => handleDeletar(aparelho.id)}>Deletar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminAparelhos;
