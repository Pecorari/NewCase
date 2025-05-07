import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import api from '../../hooks/useApi';

function ConfirmarEmail() {
  const [searchParams] = useSearchParams();
  const [mensagem, setMensagem] = useState('Confirmando seu e-mail...');
  const [erro, setErro] = useState('');
  const { atualizarUsuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setErro('Token inválido ou ausente.');
      return;
    }

    const confirmarEmail = async () => {
      try {
        const response = await api.get(`/confirmar-email?token=${token}`);

        if (response.status === 200) {
          setMensagem('E-mail confirmado com sucesso! Redirecionando...');
          await atualizarUsuario();
          navigate('/loja');
        } else {
          setErro('Não foi possível confirmar seu e-mail.');
        }
      } catch (err) {
        console.error('Erro ao confirmar e-mail:', err);
        setErro(err.response.data.mensagem);
        navigate('/loja');
      }
    };

    confirmarEmail();
  }, [searchParams, navigate, atualizarUsuario]);

  return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      {erro ? (
        <div style={{ color: 'red' }}>{erro}</div>
      ) : (
        <div>{mensagem}</div>
      )}
    </div>
  );
}

export default ConfirmarEmail;
