import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import Header from '../../components/Header';
import SidebarFiltros from '../../components/SidebarFiltros';
import Footer from '../../components/Footer';

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
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 16;
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    getAllCategorias();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        searchRef.current?.classList.add('scrolled');
        inputRef.current?.classList.add('scrolled');
        dropdownRef.current?.classList.add('scrolled');
      } else {
        searchRef.current?.classList.remove('scrolled');
        inputRef.current?.classList.remove('scrolled');
        dropdownRef.current?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getProdutosPagina(paginaAtual);
    // eslint-disable-next-line
  }, [filters, paginaAtual]);

  const getProdutosPagina = async (pagina) => {
    try {
      const query = new URLSearchParams({
        page: pagina,
        limit: itensPorPagina,
        categoria: filters.categoria || '',
        aparelho: filters.aparelho || '',
        preco_min: filters.preco_min || '',
        preco_max: filters.preco_max || '',
        cor: filters.cor || '',
        avaliacao: filters.avaliacao || ''
      });

      const endpoint = Object.values(filters).some(f => f) ? '/produtos/filters' : '/produtos';
      const response = await api.get(`${endpoint}?${query.toString()}`);

      setProdutos(response.data.produtos);
      setTotalPaginas(Math.ceil(response.data.total / itensPorPagina));
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
  };

  const handleBuscaCelular = async (e) => {
    const texto = e.target.value;
    setBuscaCelular(texto);
  
    if (texto.length >= 3) {
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
    setPaginaAtual(1);
    setFilters(prev => ({
      ...prev,
      categoria: categoriaSelected
    }));
  };

  const handleAparelhoChange = (aparelhoSelected) => {
    setPaginaAtual(1);
    setFilters(prev => ({
      ...prev,
      aparelho: aparelhoSelected
    }));
  };
  
  const handlePrecoChange = (preco_min, preco_max) => {
    setPaginaAtual(1);
    setFilters(prev => ({
      ...prev,
      preco_min: preco_min,
      preco_max: preco_max,
    }));
  };

  const handleCorChange = (corSelected) => {
    setPaginaAtual(1);
    setFilters(prev => ({
      ...prev,
      cor: corSelected,
    }));
  };

  const limparFiltros = () => {
    setPaginaAtual(1);
    setFilters({
      categoria: '',
      aparelho: '',
      preco_min: '',
      preco_max: '',
      cor: '',
      avaliacao: ''
    });
    setBuscaCelular('');
    document.querySelectorAll('input[name=preco]').forEach(r => r.checked = false);
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
      <Header inLoja={true}/>

      <div className="loja-container">
        <button className="btn-abrir-filtros" onClick={() => setFiltrosVisiveis(true)}>
          <HiAdjustmentsHorizontal />
        </button>
        <SidebarFiltros
          ativo={filtrosVisiveis}
          setAtivo={setFiltrosVisiveis}
          categorias={categorias}
          handleCategoriaChange={handleCategoriaChange}
          handlePrecoChange={handlePrecoChange}
          handleCorChange={handleCorChange}
          limparFiltros={limparFiltros}
        />
        {filtrosVisiveis ? <div className='overlay-filtro' onClick={() => setFiltrosVisiveis(false)}></div>
        : <div style={{ display: 'none' }}></div>}

        <div className='search-grid-pag'>
          <div className="barra-pesquisa" ref={searchRef}>
            <input
              type="text"
              placeholder="Qual o seu celular?"
              className="input-pesquisa"
              value={buscaCelular}
              onChange={handleBuscaCelular}
              ref={inputRef}
            />
            {sugestoes.length > 0 && (
              <ul className="sugestoes-dropdown" ref={dropdownRef}>
                {sugestoes.map((celular, index) => (
                  <li key={index} onClick={() => {
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

          <div className="grid-produtos">
            {produtos.map((produto) => {
              const imagens = produto.imagens || [];
              const indice = indiceImagem[produto.id] || 0;

              return (
                <div key={produto.id} className="card-produto" onClick={() => navigate(`/produto/${produto.id}`)}>
                  <div className="imagem-container">
                    {imagens.length > 0 && (
                      <>
                        <img src={imagens[indice] || '/placeholder.png'} alt={produto.nome} className="imagem-produto" />
                        {imagens.length > 1 && (
                          <>
                            <button className="seta seta-esquerda" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.id, imagens.length)}}><IoIosArrowBack /></button>
                            <button className="seta seta-direita" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.id, imagens.length)}}><IoIosArrowForward /></button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <h3 className='title-produto'>{produto.nome}</h3>
                  <p className="preco">R$ {produto.preco}</p>
                  <button className='btn-comprar' onClick={() => navigate(`/produto/${produto.id}`)}>Comprar</button>
                </div>
              )
            })}
          </div>
          
          <div className="paginacao">
            {[...Array(totalPaginas)].map((_, index) => (
              <button
                key={index}
                className={`pagina ${paginaAtual === index + 1 ? 'ativo' : ''}`}
                onClick={() => mudarPagina(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Loja;
