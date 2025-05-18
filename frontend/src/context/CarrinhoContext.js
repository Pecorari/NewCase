import { createContext, useContext, useState, useEffect } from 'react';
import api from '../hooks/useApi';

const CarrinhoContext = createContext();

export const CarrinhoProvider = ({ children }) => {
  const [qtdCarrinho, setQtdCarrinho] = useState(0);

  const atualizarQtdCarrinho = async () => {
    try {
      const response = await api.get('/carrinhoQtd');
      setQtdCarrinho(response.data);
    } catch (err) {
      console.error('Erro ao atualizar carrinho:', err);
    }
  };

  useEffect(() => {
    atualizarQtdCarrinho();
  }, []);

  return (
    <CarrinhoContext.Provider value={{ qtdCarrinho, atualizarQtdCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => useContext(CarrinhoContext);
