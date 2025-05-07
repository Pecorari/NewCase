import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../hooks/useApi';

import './verificarEmail.css';

const VerificarEmail = () => {
  const [reenviado, setReenviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { id, email } = location.state || {};

  const handleReenviar = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/reenviar-email', { id, email });

      setReenviado(true);
    } catch (err) {
      console.error('Erro ao reenviar e-mail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return <p>E-mail não informado. Volte e tente novamente.</p>;

  return (
    <div className='verificar-email'>
      <div className="verificar-email-page">
        <h1>📧 Verifique seu e-mail</h1><br/>
        <p>Enviamos um link de confirmação para <strong>{email}</strong></p><br/><br/>
        <p>Por favor, acesse sua caixa de entrada para ativar sua conta.</p>
        <p>⚠️ Verifique também a pasta de <strong>spam</strong> ou "promoções" caso não encontre.</p><br/>

        {!reenviado ? (
          <button onClick={handleReenviar} disabled={loading}>
            {loading ? 'Reenviando...' : 'Reenviar e-mail de verificação'}
          </button>
        ) : (
          <p className='reenviado'>E-mail reenviado com sucesso! 📩</p>
        )}

        <hr />

        <div className="faq-email">
          <h2>Não recebeu o e-mail?</h2>
          <ul>
            <li>- Verifique sua caixa de spam ou lixo eletrônico.</li>
            <li>- Aguarde alguns minutos, pode haver um pequeno atraso.</li>
            <li>- Verifique se você digitou seu e-mail corretamente no cadastro.</li>
            <li>- Clique no botão acima para reenviar o e-mail de verificação.</li>
          </ul>
        </div>

        <Link to="/" className="voltar-link">← Voltar para o início</Link>
      </div>
    </div>
  );
};

export default VerificarEmail;
