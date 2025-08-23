import React, { useState } from 'react';
import CustomModal from '../../components/Modal/CustomModal';

import whatsapp from '../../assets/utils/redes/whatsapp.png';
import instagram from '../../assets/utils/redes/instagram.png';
import facebook from '../../assets/utils/redes/facebook.png';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import api from '../../hooks/useApi';

import './contato.css';

function Contato() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      api.post('/contato-email', {nome, email, mensagem});
 
      setNome('');
      setEmail('');
      setMensagem('');
      setModalOpen(true);
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className='contatoPage'>
      <Header />
        <section className="contato">
          <div className="contato-container">
            <h1>Fale com a gente</h1>
            <p>Preencha o formulário e entraremos em contato o mais rápido possível.</p>
            <form className="contato-form" onSubmit={handleSubmit}>
              <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <textarea placeholder="Sua mensagem" rows="6" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required />
                {erro ? <p style={{ color: 'red', marginBottom: '0px' }}>{erro}</p> : <></>}
              <button type="submit">Enviar mensagem</button>

              <CustomModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Mensagem enviada!"
                confirmText="Confirmar"
              >
                <p>Responderemos o mais breve possivel.</p>
              </CustomModal>
            </form>
          </div>
          <div className="contato-redes">
            <p>Ou fale com a gente pelas redes:</p>
            <div className="redes-links">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <img src={whatsapp} alt="WhatsApp" />
              </a>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <img src={instagram} alt="Instagram" />
              </a>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <img src={facebook} alt="E-mail" />
              </a>
            </div>
          </div>
        </section>
      <Footer />
    </div>
  );
}

export default Contato;
