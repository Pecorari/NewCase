import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from "./AuthContext";
import api from '../hooks/useApi';

const CarrinhoContext = createContext();

export const CarrinhoProvider = ({ children }) => {
  const [qtdCarrinho, setQtdCarrinho] = useState(0);
  const { usuario } = useAuth();

  const atualizarQtdCarrinho = async () => {
    if (!usuario) {
      setQtdCarrinho(0);
      return;
    }

    try {
      const response = await api.get('/carrinhoQtd');
      setQtdCarrinho(response.data);
    } catch (err) {
      console.error('Erro ao atualizar carrinho:', err);
      setQtdCarrinho(0);
    }
  };

  useEffect(() => {
    atualizarQtdCarrinho();
    // eslint-disable-next-line
  }, [usuario]);

  return (
    <CarrinhoContext.Provider value={{ qtdCarrinho, atualizarQtdCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => useContext(CarrinhoContext);
