import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import api from '../../hooks/useApi';

import "./productCard.css";

function ProductCard() {
  const [produtos, setProdutos] = useState([]);
  const [indiceImagem, setIndiceImagem] = useState({});
  const [loading, setLoading] = useState(true);
  const [imagensCarregadas, setImagensCarregadas] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProdutosDestaques() {
      setLoading(true);
      try {
        const produtos = await api.get('/produtos/destaques');
        setProdutos(produtos.data);
      } catch (err) {
        console.error('Erro ao buscar produtos em destaque:', err);
      } finally {
        setLoading(false);
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
      {loading ? (
        <>
          {[1, 2, 3].map((s) => (
            <div key={s} className="link-dstq">
              <div className="produto-card-dstq">
                <Skeleton width={`100%`} height={`70%`} className="imagem-container-dtq skeleton" />

                <Skeleton width={`50%`} height={20} className="skeleton" />
                <Skeleton width={`100%`} height={20} className="skeleton" />
                <div className="botao-dstq">
                  <p className="texto-adicionar-dstq">ADICIONAR</p>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {produtos.map((produto) => {
            const imagens = produto.imagens || [];
            const indice = indiceImagem[produto.id] || 0;

            return (
              <div key={produto.id} onClick={() => {navigate(`produto/${produto.id}`)}} className="link-dstq">
                <div className="produto-card-dstq">
                  <div className="imagem-container-dtq">
                    {!imagensCarregadas[produto.id] && (
                      <Skeleton width={`100%`} height={250} className="skeleton" />
                    )}
                    {imagens.length > 0 && (
                      <>
                        <img src={imagens[indice]} alt={produto.nome} className="imagem-produto-dstq"
                          style={{ display: imagensCarregadas[produto.id] ? 'block' : 'none' }}
                          onLoad={() =>
                            setImagensCarregadas(prev => ({ ...prev, [produto.id]: true }))
                          }
                          onError={(e) => {
                            e.target.src = "/placeholder-img.svg";
                            setImagensCarregadas(prev => ({ ...prev, [produto.id]: true }));
                          }}
                        />
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
        </>
      )}
    </div>
  );
}

export default ProductCard;
