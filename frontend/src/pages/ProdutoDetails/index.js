  import React, { useEffect, useState } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { useAuth } from "../../context/AuthContext";
  import { useCarrinho } from '../../context/CarrinhoContext';
  // import Skeleton from 'react-loading-skeleton'
  // import 'react-loading-skeleton/dist/skeleton.css'
  import Skeleton from '../../components/LoadSkeleton/LoadSkeleton';

  import api from '../../hooks/useApi';
  import { calcularFrete } from '../../services/freteService';

  import Header from '../../components/Header';
  import Footer from '../../components/Footer';
  import AvaliacaoForm from '../../components/AvaliaçãoForm';
  import CustomModal from '../../components/Modal/CustomModal';

  import { IoIosStar, IoIosStarOutline } from "react-icons/io";
  import { BsTrash3 } from "react-icons/bs";

  import './ProdutoDetails.css';

  const ProdutoDetails = () => {
    const [produto, setProduto] = useState(null);
    const [quantidade, setQuantidade] = useState(1);
    const [imagemSelecionada, setImagemSelecionada] = useState(0);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [cep, setCep] = useState('');
    const [freteSimulado, setFreteSimulado] = useState({
      prazo: '',
      valor: ''
    });
    const [loadingFrete, setLoadingFrete] = useState(false);
    const [modalInfo, setModalInfo] = useState({ open: false, avaliacaoId: null });
    const [loading, setLoading] = useState(true);
    const [imagensCarregadas, setImagensCarregadas] = useState({});

    const { id } = useParams();
    const { usuario } = useAuth();
    const { atualizarQtdCarrinho } = useCarrinho();
    const navigate = useNavigate();

    useEffect(() => {
      const getProduto = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/produtos/${id}`);
          
          setProduto(response.data);
        } catch (error) {
          console.error("Erro ao buscar produto:", error);
        } finally {
          setLoading(false)
        }
      };
      getProduto();
      getAvaliacoes();
      // eslint-disable-next-line
    }, [id]);

    const aumentar = () => setQuantidade(q => q + 1);
    const diminuir = () => setQuantidade(q => (q > 1 ? q - 1 : 1));

    const adicionarAoCarrinho = async () => {
      if(!usuario) {
        navigate('/login');
      } else {
        try {
          await api.post('/carrinho/add', { produto_id: id, quantidade });
          atualizarQtdCarrinho();
          navigate('/carrinho');
        } catch (error) {
          console.log("Erro ao adicionar no carrinho:", error.response.data);
        }
      }
    };

    const compartilharNoWhatsApp = () => {
      const url = window.location.href;
      const mensagem = `Confira esse produto que achei na InfinityCell Store: ${produto.nome} - R$ ${produto.preco}\n${url}`;
      const link = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
      window.open(link, '_blank');
    };

    async function handleFrete() {
      setLoadingFrete(true);
      try {
        const resultado = await calcularFrete({
          cep_destino: cep,
          peso: produto.peso,
          comprimento: produto.comprimento,
          altura: produto.altura,
          largura: produto.largura,
          valor: produto.preco
        });

        let valor = Infinity;
        let prazo = null;

        for (const opcao of resultado) {
          if (!opcao || opcao.price == null) continue;
          const preco = parseFloat(String(opcao.price).replace(',', '.'));
          if (isNaN(preco)) continue;

          if (preco < valor) {
            valor = preco;
            prazo = opcao.delivery_time;
          }
        }
        

        if (!prazo) {
          console.log('Nenhuma opção de frete válida');
        } else {
          console.log('Prazo:', prazo, 'Dias', 'Valor: R$', valor.toFixed(2));
          setFreteSimulado({
            prazo,
            valor
          });
        }
      } catch (e) {
        console.log('Erro ao calcular o frete', e);
      } finally {
        setLoadingFrete(false);
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

    return (
      <div className='detalhes'>
        <Header />

        <div className="detalhes-container-detail">
          <button className="btn-voltar-details" onClick={() => navigate(-1)}>&larr; Voltar</button>
          <section className='hero-details'>
            <div className="imagens-section-detail">
              <div className="imagem-principal-detail">
                {!imagensCarregadas[imagemSelecionada] && (
                  <Skeleton width={`100%`} height={`100%`} rounded={10} />
                )}
                <img src={produto?.imagens?.[imagemSelecionada]} alt={produto?.nome} className="imagem-zoom-detail-detail"
                  style={{ display: imagensCarregadas[imagemSelecionada] ? 'block' : 'none' }}
                  onLoad={() =>
                    setImagensCarregadas(prev => ({ ...prev, [imagemSelecionada]: true }))
                  }
                  onError={(e) => {
                    e.target.src = "/placeholder-img.svg";
                    setImagensCarregadas(prev => ({ ...prev, [imagemSelecionada]: true }));
                  }}
                />
              </div>
              <div className="carrossel-miniaturas-detail">
                {produto?.imagens.map((img, idx) => (
                  <div key={idx} className="miniatura-wrapper">
                    {!imagensCarregadas[`mini-${idx}`] && (
                      <Skeleton width={70} height={70} rounded={8} />
                    )}
                    <img
                      src={img}
                      alt={`Miniatura ${idx}`}
                      className={`miniatura ${idx === imagemSelecionada ? 'ativa' : ''}`}
                      style={{ display: imagensCarregadas[`mini-${idx}`] ? 'block' : 'none' }}
                      onClick={() => setImagemSelecionada(idx)}
                      onLoad={() =>
                        setImagensCarregadas(prev => ({ ...prev, [`mini-${idx}`]: true }))
                      }
                      onError={(e) => {
                        e.target.src = "/placeholder-img.svg";
                        setImagensCarregadas(prev => ({ ...prev, [`mini-${idx}`]: true }))
                      }}
                      />
                  </div>
                ))}
              </div>
            </div>

            <div className="info-section-detail">
              <div className="col-esquerda">
                {loading ? (
                  <>
                    <Skeleton width={`80%`} height={42} marginBottom={5}/>
                    <Skeleton width={`40%`} height={22} marginBottom={5}/>
                    <Skeleton width={`100%`} height={22} marginBottom={15}/>
                    <Skeleton width={`30%`} height={26} marginBottom={5}/>
                  </>
                ) : (
                  <>
                    <h2 className="titulo-detail">{produto?.nome}</h2>
                    <div className='title-star'>
                      <br className='entre-title-star' />{renderEstrelas(produto?.avaliacao_media)}
                    </div>
                    <p className="descricao-detail">{produto?.descricao}</p>
                    <p className="preco-detail">R$ {produto?.preco}</p>
                  </>
                )}

                <div className="quantidade-detail">
                  <div className='quantidade-selector'>
                    <button className='btn-detail' onClick={diminuir}>-</button>
                    <input className='input-detail' type="text" value={quantidade} readOnly />
                    <button className='btn-detail' onClick={aumentar}>+</button>
                  </div>
                  <p className='qnt-disponivel'>Disponível: {produto?.estoque}</p>
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
                      <img src='/redes/whatsapp-logo-white.svg' alt='whatsapp' />
                    </button>
                  </div>
                </div>
              </div>


            <div className="frete-container">
              <div className='frete-box'>
                <input type="text" placeholder="Digite seu CEP" value={cep} onChange={handleInputChange} maxLength={10} />
                <button onClick={handleFrete} disabled={loadingFrete}>{loadingFrete ? 'Calculando...' : 'Calcular Frete'}</button>
              </div>
            
              {freteSimulado.valor !== '' && (
                <div className="resultado-frete">
                  <ul className="frete-lista">
                      <li className="frete-item">
                        <img
                          src='/frete-icon.svg'
                          alt='Frete Logo'
                          className="frete-logo"
                        />
                        <div className="frete-detalhes">
                          <h4>{freteSimulado.name}Frete a partir de R$ {freteSimulado.valor} - {freteSimulado.prazo} dias úteis</h4>
                          {freteSimulado.error ? (
                            <p>{freteSimulado.error}</p>
                          ) : (
                            <p>*Simulação, mais opções no checkout.</p>
                          )}
                        </div>
                      </li>
                  </ul>
                </div>
              )}
            </div>
            </div>
          </section>
        

          <section className="secao-caracteristicas">
            <h2 className='section-title-ct'>Características</h2>
            {loading ? (
              <div className='caracteristicas-dados'>
                <Skeleton width={`10%`} height={20} marginBottom={5} />
                <Skeleton width={`15%`} height={20} marginBottom={5} />
                <Skeleton width={`13%`} height={20} marginBottom={5} />
                <br/>
                <Skeleton width={`17%`} height={20} marginBottom={5} />
                <Skeleton width={`13%`} height={20} marginBottom={5} />
                <Skeleton width={`15%`} height={20} marginBottom={5} />
                <br/>
                <Skeleton width={`20%`} height={20} marginBottom={5} />
              </div>
            ) : (
              <div className='caracteristicas-dados'>
                <p className='caracteristicas'>Altura: {produto?.altura}</p>
                <p className='caracteristicas'>Largura: {produto?.largura}</p>
                <p className='caracteristicas'>comprimento: {produto?.comprimento}</p>
                <br/>
                <p className='caracteristicas'>Material: {produto?.material}</p>
                <p className='caracteristicas'>Peso: {produto?.peso}</p>
                <p className='caracteristicas'>Cor: {produto?.cor}</p>
                <br/>
                <p className='caracteristicas'>Compatibilidade: {produto?.aparelho_nome}</p>
                <p className='caracteristicas'>Categoria: {produto?.categoria_nome}</p>
              </div>
            )}
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
