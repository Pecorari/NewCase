import React, { useEffect, useState } from 'react';
import { BsTrash3 } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

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
        return acc + Number(produto.preco) * Number(produto.quantidade);
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
      <div className="carrinho-container">
        <button className="btn-voltar-carrinho" onClick={() => navigate(-1)}>&larr; Voltar</button>
        <h2 className='title-cart'>Seu Carrinho</h2>

        <ul className="carrinho-itens">
          {produtos.length !== 0 ? produtos.map((produto, index) => {
            const imagens = produto.imagens || [];
            const indice = indiceImagem[produto.carrinho_id] || 0;

            return (
              <li key={index} className="item" onClick={() => navigate(`/produto/${produto.produto_id}`)}>
                <div className="imagem-carrinho-container">
                  {imagens.length > 0 && (
                    <>
                      <img src={imagens[indice]} alt={produto.produto_nome} className="produto-img" />
                      {imagens.length > 1 && (
                        <>
                          <button className="seta seta-esquerda" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.carrinho_id, imagens.length)}}><IoIosArrowBack /></button>
                          <button className="seta seta-direita" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.carrinho_id, imagens.length)}}><IoIosArrowForward /></button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className='info-item'>
                  <span className="title">{produto.produto_nome}</span>
                  <span className="compativel">{produto.aparelho_nome}</span>
                </div>
                <div className='info-preco-item'>
                  <span className="preco-carrinho">QTD: {produto.quantidade}</span>
                  <span className="preco-carrinho">{(produto.preco * produto.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>

                <button className="remover" onClick={(e) => {e.preventDefault(); e.stopPropagation(); removeCart(produto.carrinho_id)}}><BsTrash3 /></button>
              </li>
            );
          }) : <p className='msg-carrinho-vazio'>Seu carriho está vazio! <br/><br/> Você ainda não adicionou nenhum produto ao carrinho.</p>
          }
        </ul>

        <div className="total-container">
          <p className='total'>Total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <div className='btn-total'>
            <button className="continuar-comprando" onClick={() => navigate('/loja')}>&larr; Voltar as compras</button>
            <button className="finalizar" onClick={() => {
              if (produtos.length === 0) return;
              navigate('/checkout');
            }} disabled={produtos.length === 0}>Finalizar Pedido</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Carrinho;
