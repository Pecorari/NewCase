import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from 'react-router-dom';

import api from '../../../hooks/useApi';

import './avaliacaoForm.css';

const AvaliacaoForm = ({ onSubmit }) => {
  const [comentario, setComentario] = useState('');
  const [nota, setNota] = useState(5);

  const { id } = useParams();
  const { usuario } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nome = usuario.nome;
    const payload = {
      produtoId: id,
      comentario: comentario,
      avaliacao: nota
    }
    
    console.log(payload);
    const result = await api.post(`/avaliacoes/add`, payload);

    console.log(result);
    onSubmit({ nome, comentario, nota });
    setComentario('');
    setNota(5);
  };

  const renderEstrelas = () => {
    return [1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={`estrela ${n <= nota ? 'ativa' : ''}`} onClick={() => setNota(n)}>
        ★
      </span>
    ));
  };

  return (
    <div className="container-form">
      <h3>Deixe sua Avaliação</h3>
      {!usuario ?
      <div className='login-av'>
        <p>Entre em sua conta para deixar a sua avaliação do produto.</p>
        <Link to="/login" className="loginIcon">Login</Link>
      </div>
      :
      <form onSubmit={handleSubmit} className='form-avaliacao'>
        <textarea placeholder='Seu comentario' rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} required />
        <div className="estrelas-group">
          <div className="estrelas">{renderEstrelas()}</div>
        </div>
        <button type="submit" className="btn-avaliar">Enviar Avaliação</button>
      </form>}
    </div>
  );
};

export default AvaliacaoForm;
