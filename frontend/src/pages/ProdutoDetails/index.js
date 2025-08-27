import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { useCarrinho } from '../../context/CarrinhoContext';

import api from '../../hooks/useApi';
import { calcularFrete } from '../../services/freteService';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AvaliacaoForm from '../../components/AvaliaçãoForm';
import CustomModal from '../../components/Modal/CustomModal';

import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import { BsTrash3 } from "react-icons/bs";
import whatsapp from '../../assets/utils/redes/whatsapp-logo-white.png';

import './ProdutoDetails.css';

const ProdutoDetails = () => {
  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [imagemSelecionada, setImagemSelecionada] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [cep, setCep] = useState('');
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({ open: false, avaliacaoId: null });

  const { id } = useParams();
  const { usuario } = useAuth();
  const { atualizarQtdCarrinho } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    const getProduto = async () => {
      try {
        const response = await api.get(`/produtos/${id}`);
        setProduto(response.data);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      }
    };
    getProduto();
    getAvaliacoes();
    // eslint-disable-next-line
  }, [id]);

  const aumentar = () => setQuantidade(q => q + 1);
  const diminuir = () => setQuantidade(q => (q > 1 ? q - 1 : 1));

  const adicionarAoCarrinho = async () => {
    try {
      await api.post('/carrinho/add', { produto_id: id, quantidade });
      atualizarQtdCarrinho();
      navigate('/carrinho');
    } catch (error) {
      console.log("Erro ao adicionar no carrinho:", error.response.data);
    }
  };

  const compartilharNoWhatsApp = () => {
    const url = window.location.href;
    const mensagem = `Confira esse produto que achei na InfinityCell Store: ${produto.nome} - R$ ${produto.preco}\n${url}`;
    const link = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');
  };

  async function handleFrete() {
    setLoading(true);
    try {
      const resultado = await calcularFrete({
        cep_destino: cep,
        peso: produto.peso,
        comprimento: produto.comprimento,
        altura: produto.altura,
        largura: produto.largura,
        valor: produto.preco
      });
      
      setFretes(resultado);
    } catch (e) {
      console.log('Erro ao calcular o frete', e);
    } finally {
      setLoading(false);
    }
  }

  const renderEstrelas = (media) => {
    const estrelas = [];
  
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        i <= Math.floor(media)
          ? <IoIosStar key={i} color="#ffc107" className='stars-title'/>
          : <IoIosStarOutline key={i} color="#555" className='stars-title'/>
      );
    }
  
    return estrelas;
  };

  const getAvaliacoes = async () => {
    try {
      const response = await api.get(`/avaliacoes/${id}`);
      setAvaliacoes(response.data);
    } catch (error) {
      console.log("Erro ao lsitar avaliações", error);
    }
  };

  const delAvaliacao = async (avaliacaoId) => {
    try {
      await api.delete(`/avaliacoes/del/${avaliacaoId}`);
      getAvaliacoes();
      setModalInfo({ open: false, avaliacaoId: null });
      console.log('apagado id:', avaliacaoId)
    } catch (error) {
      console.log("Erro ao apagar a avaliação:", error);
    }
  };

  const adicionarAvaliacao = () => {
    getAvaliacoes();
  };

  const handleInputChange = (e) => {
    const { value } = e.target;

    let formattedValue = value;

    formattedValue = value
      .replace(/\D/g, '')
      .slice(0, 8) 
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1-$2');

    setCep(formattedValue);
  }

  if (!produto) return <div>Produto não encontrado</div>;

  return (
    <div className='detalhes'>
      <Header />

      <div className="detalhes-container-detail">
        <button className="btn-voltar-details" onClick={() => navigate(-1)}>&larr; Voltar</button>
        <section className='hero-details'>
          <div className="imagens-section-detail">
            <div className="imagem-principal-detail">
              <img
                src={produto.imagens[imagemSelecionada]}
                alt={produto.nome}
                className="imagem-zoom-detail-detail"
                />
            </div>
            <div className="carrossel-miniaturas-detail">
              {produto.imagens.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Miniatura ${idx}`}
                  className={`miniatura ${idx === imagemSelecionada ? 'ativa' : ''}`}
                  onClick={() => setImagemSelecionada(idx)}
                  />
              ))}
            </div>
          </div>

          <div className="info-section-detail">
            <div className="col-esquerda">
              <h2 className="titulo-detail">{produto.nome}</h2>
              <div className='title-star'>
                <br className='entre-title-star' />{renderEstrelas(produto.avaliacao_media)}
              </div>
              <p className="descricao-detail">{produto.descricao}</p>
              <p className="preco-detail">R$ {produto.preco}</p>

              <div className="quantidade-detail">
                <div className='quantidade-selector'>
                  <button className='btn-detail' onClick={diminuir}>-</button>
                  <input className='input-detail' type="text" value={quantidade} readOnly />
                  <button className='btn-detail' onClick={aumentar}>+</button>
                </div>
                <p className='qnt-disponivel'>Disponível: {produto.estoque}</p>
              </div>
            </div>

            <div className="acoes-detail-container">
              <div className="acoes-detail">
                <div className="formas-pagamento">
                  <h4>Formas de Pagamento</h4>
                  <ul>
                    <li>💳 Cartão de Crédito (até 3x sem juros)</li>
                    <li>💵 Pix (5% de desconto)</li>
                    <li>🏦 Boleto Bancário</li>
                  </ul>
                </div>

                <div className='btn-acoes-detail'>
                  <button className="botao-carrinho-detail" onClick={adicionarAoCarrinho}>
                    Adicionar ao Carrinho
                  </button>

                  <button className="botao-whatsapp" onClick={compartilharNoWhatsApp}>
                    Compartilhar 
                    <img src={whatsapp} alt='whatsapp' />
                  </button>
                </div>
              </div>
            </div>


          <div className="frete-container">
            <div className='frete-box'>
              <input type="text" placeholder="Digite seu CEP" value={cep} onChange={handleInputChange} maxLength={10} />
              <button onClick={handleFrete} disabled={loading}>{loading ? 'Calculando...' : 'Calcular Frete'}</button>
            </div>
          
            {fretes.length > 0 && (
              <div className="resultado-frete">
                <h4>Opções de envio:</h4>
                <ul className="frete-lista">
                  {fretes.map((opcao, index) => (
                    <li className="frete-item" key={index}>
                      <img
                        src={opcao.company.picture}
                        alt={opcao.name}
                        className="frete-logo"
                      />
                      <div className="frete-detalhes">
                        <h4>{opcao.name}</h4>
                        {opcao.error ? (
                          <p>{opcao.error}</p>
                        ) : (
                          <p>
                            R$ {opcao.price} - {opcao.delivery_time} dias úteis
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          </div>

        </section>
      

        <section className="secao-caracteristicas">
          <h2 className='section-title-ct'>Características</h2>

          <div className='caracteristicas-dados'>
            <p className='caracteristicas'>Altura: {produto.altura}</p>
            <p className='caracteristicas'>Largura: {produto.largura}</p>
            <p className='caracteristicas'>comprimento: {produto.comprimento}</p>
            <br/>
            <p className='caracteristicas'>Material: </p>
            <p className='caracteristicas'>Peso: {produto.peso}</p>
            <p className='caracteristicas'>Cor: {produto.cor}</p>
            <br/>
            <p className='caracteristicas'>Compatibilidade: {produto.aparelho_nome}</p>
          </div>
        </section>

        <section className="secao-avaliacoes">
          <h2 className='section-title-av'>Avaliações</h2>
          {avaliacoes.length === 0 ? (
            <p>Seja o primeiro a avaliar este produto!</p>
          ) : (
            <ul className="lista-avaliacoes">
              {avaliacoes.map((avaliacao, index) => {
                return (
                  <li key={index} className="item-avaliacao">
                    <div className='avaliacao'>
                      <div className='header-av'>
                        <strong>{avaliacao.usuario_nome}</strong>
                        <div className="estrelas-avaliacao">
                          {[...Array(avaliacao.avaliacao)].map((_, i) => (
                            <span key={i} className='stars-avaliacao-item'>★</span>
                          ))}
                        </div>
                      </div>
                      <p className='coments'>{avaliacao.comentario}</p>
                    </div>
                    {usuario && avaliacao.usuario_id === usuario.id ?
                      <BsTrash3 className='lixeira' onClick={() => {setModalInfo({ open: true, avaliacaoId: avaliacao.id })}} /> : <></>
                    }
                  </li>
                );
              })}
              <CustomModal
                isOpen={modalInfo.open}
                onClose={() => setModalInfo({ open: false, avaliacaoId: null })}
                title="Confirmar exclusão"
                confirmText="Confirmar"
                onConfirm={() => delAvaliacao(modalInfo.avaliacaoId)}
              >
                <p>Você tem certeza que deseja excluir sua avaliação?</p>
              </CustomModal>
            </ul>
          )}

          <AvaliacaoForm onSubmit={adicionarAvaliacao} />
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ProdutoDetails;
