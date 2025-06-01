import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../hooks/useApi';

import "./productCard.css";

function ProductCard() {
  const [produtos, setProdutos] = useState([]);
  const [indiceImagem, setIndiceImagem] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    getProdutosDestaque();
  }, []);
  
  async function getProdutosDestaque() {
    try {
      const produtos = await api.get('/produtos/destaques');
      setProdutos(produtos.data);
    } catch (err) {
      console.error('Erro ao buscar produtos em destaque:', err);
    }
  }

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
    <div className="produto-dstq">
      {produtos.map((produto) => {
        const imagens = produto.imagens || [];
        const indice = indiceImagem[produto.id] || 0;

        return (
          <div key={produto.id} onClick={() => {navigate('/carrinho')}} className="link-dstq">
            <div className="produto-card-dstq">
              <div className="imagem-container-dtq">
                {imagens.length > 0 && (
                  <>
                    <img src={imagens[indice]} alt={produto.nome} className="imagem-produto-dstq" />
                    {imagens.length > 1 && (
                      <>
                        <button className="seta-dtq seta-esquerda-dtq" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.id, imagens.length)}}>&lt;</button>
                        <button className="seta-dtq seta-direita-dtq" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.id, imagens.length)}}>&gt;</button>
                      </>
                    )}
                  </>
                )}
              </div>
              <h3>{produto.nome}</h3>
              <p>{produto.descricao}</p>
              <div className="botao-dstq">
                <span className="texto-adicionar-dstq">ADICIONAR</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

export default ProductCard;
