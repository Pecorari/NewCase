import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import api from '../../hooks/useApi';

import "./productCard.css";

function ProductCard() {
  const [produtos, setProdutos] = useState([]);
  const [indiceImagem, setIndiceImagem] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProdutosDestaques() {
      try {
        const produtos = await api.get('/produtos/destaques');
        setProdutos(produtos.data);
      } catch (err) {
        console.error('Erro ao buscar produtos em destaque:', err);
      }
    }

    fetchProdutosDestaques();
  }, []);

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
                        <button className="seta-dtq seta-esquerda-dtq" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.id, imagens.length)}}><IoIosArrowBack /></button>
                        <button className="seta-dtq seta-direita-dtq" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.id, imagens.length)}}><IoIosArrowForward /></button>
                      </>
                    )}
                  </>
                )}
              </div>
              <h3 className="title-dstq">{produto.nome}</h3>
              <p className="desc-dstq">{produto.descricao}</p>
              <div className="botao-dstq">
                <p className="texto-adicionar-dstq">ADICIONAR</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

export default ProductCard;
