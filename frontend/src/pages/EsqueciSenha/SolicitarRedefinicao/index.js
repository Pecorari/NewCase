import React, { useState } from 'react';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

import api from '../../../hooks/useApi';
import './solicitarRedefinicao.css';

function SolicitarRedefinicao() {
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');
  const [desabilitado, setDesabilitado] = useState(false);
  const [loading, setLoading] = useState(false);

  const enviarEmail = async(e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setDesabilitado(true);

    try {
      await api.post('/esqueci-senha', {email});

      setMensagem('Email de redefinição enviado com sucesso!');
    } catch (error) {
      console.log('Erro ao se comunicar com servidor', error);
    }

    setTimeout(() => {
      setDesabilitado(false);
      setLoading(false);
    }, 5000);
  }

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  }

  return (
    <div className='solicitarRedefinicaoPage'>
      <Header />
      <section className="solicitarRedefinicao-section">
        <div className="solicitarRedefinicao-container">
          <h2>Digite o email da sua conta</h2>
          <form className="solicitarRedefinicao-form" onSubmit={enviarEmail}>
            <input type="email" name='email' value={email} onChange={handleInputChange} placeholder="Seu e-mail" autoComplete='email' required />

            {mensagem ? <p className='solicitarRedefinicao-mensagem'>{mensagem}</p> : <></>}

            <button type="submit" disabled={desabilitado}>
              {desabilitado ? 'Aguarde...' : 'Enviar'}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default SolicitarRedefinicao;
