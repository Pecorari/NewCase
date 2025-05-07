import { createContext, useContext, useEffect, useState } from 'react';
import api from '../hooks/useApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/profile');
        setUsuario(res.data);
      } catch {
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, senha) => {
    await api.post('/usuarios/login', { email, senha });
    const res = await api.get('/profile');
    setUsuario(res.data);
  };

  const cadastro = async (nome, cpf, telefone, data_nasc, email, senha) => {
    await api.post('usuarios/add', { nome, cpf, telefone, data_nasc, email, senha });
  };

  const logout = async () => {
    await api.post('/usuarios/logout');
    setUsuario(null);
  };

  const atualizarUsuario = async () => {
    try {
      const res = await api.get('/profile');
      setUsuario(res.data);
    } catch {
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, cadastro, logout, carregando, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
