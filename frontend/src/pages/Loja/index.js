import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../Componentes/Header/index';
import Footer from '../Componentes/Footer/index';

import api from '../../hooks/useApi';
import './loja.css';

const Loja = () => {
  const [produtos, setProdutos] = useState([]);
  const [indiceImagem, setIndiceImagem] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [filters, setFilters] = useState({
    categoria: '',
    aparelho: null,
    preco_min: null,
    preco_max: null,
    cor: '',
    avaliacao: null,
  });
  const [buscaCelular, setBuscaCelular] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 16;

  const navigate = useNavigate();

  useEffect(() => {
    getAllProdutos();
    getAllCategorias();
    getFilteredProdutos(filters);
  }, [filters]);
  
  async function getAllProdutos() {
    try {
      const produtos = await api.get('/produtos');
      setProdutos(produtos.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  }

  const handleBuscaCelular = async (e) => {
    const texto = e.target.value;
    setBuscaCelular(texto);
  
    if (texto.length >= 2) {
      try {
        const response = await api.get(`/aparelhos/search?busca=%${texto}%`);
        setSugestoes(response.data);
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
      }
    } else {
      setSugestoes([]);
    }
  };

  async function getAllCategorias() {
    try {
      const categorias = await api.get('/categorias');
      setCategorias(categorias.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }

  const handleCategoriaChange = (categoriaSelected) => {
    setFilters(prev => ({
      ...prev,
      categoria: categoriaSelected
    }));
  };

  const handleAparelhoChange = (aparelhoSelected) => {
    setFilters(prev => ({
      ...prev,
      aparelho: aparelhoSelected
    }));
  };
  
  const handlePrecoChange = (preco_min, preco_max) => {
    setFilters(prev => ({
      ...prev,
      preco_min: preco_min,
      preco_max: preco_max,
    }));
  };

  const handleCorChange = (corSelected) => {
    setFilters(prev => ({
      ...prev,
      cor: corSelected,
    }));
  };
  
  // const handleAvaliacaoChange = (nota) => {
  //   setFilters(prev => ({
  //     ...prev,
  //     avaliacao: nota,
  //   }));
  // };

  const getFilteredProdutos = async (filters) => {
    const query = new URLSearchParams();
  
    if (filters.categoria)
      query.append("categoria", filters.categoria);
  
    if (filters.aparelho)
      query.append("aparelho", filters.aparelho);

    if (filters.preco_min)
      query.append("preco_min", filters.preco_min);

    if (filters.preco_max)
      query.append("preco_max", filters.preco_max);
  
    if (filters.cor.length)
      query.append("cor", filters.cor);
  
    if (filters.avaliacao)
      query.append("avaliacao", filters.avaliacao);
  
    const produtos = await api.get(`/produtos/filters?${query.toString()}`);

    setProdutos(produtos.data);
  };

  const limparFiltros = () => {
    setFilters({
      categoria: '',
      aparelho: '',
      preco_min: '',
      preco_max: '',
      cor: '',
      avaliacao: ''
    });
    setBuscaCelular([]);
    document.querySelectorAll('input[name=preco]').forEach(r => r.checked = false);
  };

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const produtosPagina = produtos.slice(indexPrimeiroItem, indexUltimoItem);
  
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
  
  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
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
    <div className='loja'>
      <Header />
      <div className="loja-container">
      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Qual o seu celular?"
          className="input-pesquisa"
          value={buscaCelular}
          onChange={handleBuscaCelular}
        />
        {sugestoes.length > 0 && (
          <ul className="sugestoes-dropdown">
            {sugestoes.map((celular, index) => (
              <li
                key={index}
                onClick={() => {
                  setBuscaCelular(celular.nome);
                  handleAparelhoChange(celular.nome);
                  setSugestoes([]);
                }}
              >
                {celular.nome}
              </li>
            ))}
          </ul>
        )}
      </div>
        
        <aside className="sidebar">
          <div className="filtro-grupo">
            <h3>Categoria</h3>
            <ul>
            {categorias.map((categoria) => (
              <li key={categoria.id} onClick={() => {handleCategoriaChange(categoria.nome)}}>{categoria.nome}</li>
            ))}
            </ul>
          </div>

          <div className="filtro-grupo">
            <h3>Preço</h3>
            <label><input type="radio" name="preco" onChange={() => {handlePrecoChange(0, 15)}}/> Até R$15</label><br />
            <label><input type="radio" name="preco" onChange={() => {handlePrecoChange(15, 25)}}/> R$15 a R$25</label><br />
            <label><input type="radio" name="preco" onChange={() => {handlePrecoChange(25, 35)}}/> R$25 a R$35</label><br />
            <label><input type="radio" name="preco" onChange={() => {handlePrecoChange(35, 50)}}/> R$35 a R$50</label><br />
            <label><input type="radio" name="preco" onChange={() => {handlePrecoChange(50, 1000)}}/> Acima de R$50</label>
          </div>

          <div className="filtro-grupo">
            <h3>Cores</h3>
            <div className="color-dots">
              <span onClick={() => {handleCorChange('Azul')}} className="dot blue"></span>
              <span onClick={() => {handleCorChange('Rosa')}} className="dot pink"></span>
              <span onClick={() => {handleCorChange('Vermelho')}} className="dot red"></span>
              <span onClick={() => {handleCorChange('Verde')}} className="dot green"></span>
              <span onClick={() => {handleCorChange('Laranja')}} className="dot orange"></span>
            </div>
          </div>

          {/* <div className="filtro-grupo">
            <h3>Avaliação</h3>
            <div onClick={() => {handleAvaliacaoChange(5)}} className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <div onClick={() => {handleAvaliacaoChange(4)}} className="stars">&#9733;&#9733;&#9733;&#9733;&#9734;</div>
            <div onClick={() => {handleAvaliacaoChange(3)}} className="stars">&#9733;&#9733;&#9733;&#9734;&#9734;</div>
            <div onClick={() => {handleAvaliacaoChange(2)}} className="stars">&#9733;&#9733;&#9734;&#9734;&#9734;</div>
            <div onClick={() => {handleAvaliacaoChange(1)}} className="stars">&#9733;&#9734;&#9734;&#9734;&#9734;</div>
          </div> */}

          <button className='reset-filter' onClick={limparFiltros}>
            Limpar filtros
          </button>
        </aside>

        <div className="grid-produtos">
          {produtosPagina.map((produto) => {
            const imagens = produto.imagens || [];
            const indice = indiceImagem[produto.id] || 0;

            return (
              <div key={produto.id} className="card-produto" onClick={() => navigate(`/produto/${produto.id}`)}>
                <div className="imagem-container">
                  {imagens.length > 0 && (
                    <>
                      <img src={imagens[indice]} alt={produto.nome} className="imagem-produto" />
                      {imagens.length > 1 && (
                        <>
                          <button className="seta seta-esquerda" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.id, imagens.length)}}>&lt;</button>
                          <button className="seta seta-direita" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.id, imagens.length)}}>&gt;</button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <h3 className='title-produto'>{produto.nome}</h3>
                <p className="preco">R$ {produto.preco}</p>
                <button onClick={() => navigate(`/produto/${produto.id}`)}>Comprar</button>
              </div>
            )
          })}
        </div>
        
        <div className="paginacao">
          {[...Array(totalPaginas)].map((_, index) => (
            <button
              key={index}
              className={paginaAtual === index + 1 ? 'ativo' : ''}
              onClick={() => mudarPagina(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Loja;
