import React, { useEffect, useState } from 'react';

import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";

import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import api from '../../hooks/useApi';

import "./carrinho.css";

const Carrinho = () => {
  const { atualizarQtdCarrinho  } = useCarrinho();
  const [produtos, setProdutos] = useState([]);
  const [indiceImagem, setIndiceImagem] = useState({});
  const [valorTotal, setValorTotal] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    getProdutos();
  }, []);

  const getProdutos = async () => {
    try {
      const response = await api.get('/carrinho');
      setProdutos(response.data);

      const total = response.data.reduce((acc, produto) => {
        return acc + produto.preco * produto.quantidade;
      }, 0);

      setValorTotal(total);
    } catch (error) {
      console.log('Não foi possivel listar produtos do carrinho:', error);
    }
  }

  const removeCart = async (id) => {
    try {
      await api.delete(`/carrinho/del/${id}`);
      console.log('removido!');
      atualizarQtdCarrinho();
      getProdutos();
    } catch (error) {
      console.log('Não foi possivel remover o produto:', error);
    }
  };
  
  const proximaImagem = (id, total) => {
    setIndiceImagem(prev => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % total
    }));
  };
  
  const imagemAnterior = (id, total) => {
    setIndiceImagem(prev => ({
      ...prev,
      [id]: ((prev[id] ?? 0) - 1 + total) % total
    }));
  };
  
  return (
    <div className="carrinho">
      <Header />
      <button className="btn-voltar-carrinho" onClick={() => navigate(-1)}>&larr; Voltar</button>
      <div className="carrinho-container">
        <h2>Seu Carrinho</h2>

        <ul className="carrinho-itens">

        {produtos.length !== 0 ? produtos.map((produto, index) => {
          const imagens = produto.imagens || [];
          const indice = indiceImagem[produto.carrinho_id] || 0;

          return (
            <li key={index} className="item">

              <div className="imagem-carrinho-container">
                {imagens.length > 0 && (
                  <>
                    <img src={imagens[indice]} alt={produto.nome} className="produto-img" />
                    {imagens.length > 1 && (
                      <>
                        <button className="seta seta-esquerda" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.carrinho_id, imagens.length)}}>&lt;</button>
                        <button className="seta seta-direita" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.carrinho_id, imagens.length)}}>&gt;</button>
                      </>
                    )}
                  </>
                )}
              </div>

              <span className="nome">{produto.nome}</span>
              <span className="preco-carrinho">QTD: {produto.quantidade}</span>
              <span className="preco-carrinho">R$ {produto.preco}</span>
              <button className="remover" onClick={(e) => {e.preventDefault(); removeCart(produto.carrinho_id)}}>Remover</button>
            </li>
          );
        }) : <p className='msg-carrinho-vazio'>Seu carriho está vazio! <br/><br/> Você ainda não adicionou nenhum produto ao carriho.</p>
        }

        </ul>

        <div className="total-container">
          <button className="continuar-comprando" onClick={() => navigate('/loja')}>&larr; Voltar as compras</button>
          <div className='total'>
            <strong>Total: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            <button className="finalizar" onClick={() => console.log('Finalizar compra!')} disabled={produtos.length === 0}>Finalizar Compra</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Carrinho;
