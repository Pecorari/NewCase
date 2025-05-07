import React, { useState } from 'react';
import { useSearchParams, useNavigate  } from 'react-router-dom';

import Header from '../../Componentes/Header/index';
import Footer from '../../Componentes/Footer/index';

import api from '../../../hooks/useApi';
import './redefinirSenha.css';

function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [erro, setErro] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showModal, setShowModal] = useState(false);

  const mudarSenha = async(e) => {
    e.preventDefault();

    const token = searchParams.get('token');

    if (!token) {
      setErro('Token inválido ou ausente.');
      return;
    }

    if (senha !== confirmSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      await api.post('/redefinir-senha', {token: token, novaSenha: senha});

      console.log('Senha alterada com sucesso!!');
      setSenha('');
      setConfirmSenha('');
      setErro('');
      setShowModal(true);
    } catch (error) {
      console.log('Erro ao se comunicar com servidor', error);
      setErro(error?.response?.data?.erros?.[0]?.msg || error.response.data.mensagem);
    }
  }

  return (
    <div className='redefinirSenhaPage'>
      <Header />
      <section className="redefinirSenha-section">
        <div className="redefinirSenha-container">
          <h2>Digite sua nova Senha</h2>
          <form className="redefinirSenha-form" onSubmit={mudarSenha}>
            <input type="password" name='senha' value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Nova senha" required />
            <input type="password" name='senha' value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} placeholder="Confirme sua senha" required />

            {erro ? <p className='redefinirSenha-mensagem'>{erro}</p> : <></>}

            <button type="submit">Ok</button>
          </form>
        </div>
      </section>
      <Footer />


      {showModal && (
        <div className="modal-overlay-rs">
          <div className="modal-content-rs">
            <h3>Senha alterada com sucesso!</h3>
            <button onClick={() => navigate('/login')}>Ir para o Login</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RedefinirSenha;
