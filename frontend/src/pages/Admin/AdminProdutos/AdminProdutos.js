import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { storage } from '../../../services/firebase';
import api from '../../../hooks/useApi';

import './AdminProdutos.css';

const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [aparelhos, setAparelhos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [formAberto, setFormAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [formSearch, setFormSearch] = useState('');
  const [form, setForm] = useState({
    nome: '',
    aparelho_id: '',
    cor: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    material: '',
    estoque: '',
    destaque: '',
    peso: '',
    altura: '',
    largura: '',
    comprimento: '',
    imagens: []
  });
  const [editandoId, setEditandoId] = useState(null);
  const [modalProduto, setModalProduto] = useState(null);
  const [indiceImagem, setIndiceImagem] = useState({});

  useEffect(() => {
    buscarProdutos(1);
    buscarAparelhos();
    buscarCategorias();
  }, []);

  const buscarProdutos = async (valuePage = 1) => {
    try {
      const response = await api.get(`/produtos?page=${valuePage}&limit=${16}`);

      console.log(response.data.produtos);
      setProdutos(response.data.produtos);
      setPage(response.data.page);
      setTotalPaginas(response.data.totalPaginas);
      setFormSearch('')
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar produtos:', err);
    }
  };
  const buscarAparelhos = async () => {
    try {
      const response = await api.get('/aparelhos');
      setAparelhos(response.data);
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao  listar aparelhos');
      console.error('Erro ao buscar aparelhos:', err);
    }
  };
  const buscarCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar categorias:', err);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'imagens') {
      const newFiles = Array.from(files);
      const updatedImages = [
        ...form.imagens,
        ...newFiles.map(file => ({
          file,
          url: URL.createObjectURL(file), 
          acao: "nova"
        }))
      ];
      
      setForm({ ...form, imagens: updatedImages });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleInputSearchChange = (e) => {
    setFormSearch(e.target.value);
  };

  const searchProdutos = async (e) => {
    e.preventDefault();

    const isNumber = !isNaN(formSearch) && formSearch.trim() !== "";

    if (!isNumber && formSearch.length < 2) {
      setErro("Digite pelo menos 2 caracteres para buscar.");
      return;
    }

    try {
      const response = await api.get(`/produtos/search?busca=${formSearch}`);
      setProdutos(response.data);
      setFormSearch('');
      setErro('');
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao buscar produtos");
    }
  };

  const uploadImagens = async (imagens) => {
    const uploaded = [];

    for (const imagem of imagens) {
      if (imagem.acao === "nova" && imagem.file) {
        const nomeArquivo = `produtos/${uuidv4()}-${imagem.file.name}`;
        const imagemRef = ref(storage, nomeArquivo);
        await uploadBytes(imagemRef, imagem.file);
        const url = await getDownloadURL(imagemRef);

        uploaded.push({ url, acao: "nova" });
      } else if (imagem.id) {
        uploaded.push(imagem);
      }
    }

    return uploaded;
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = form.imagens.map((item, idx) =>
        idx === indexToRemove ? { ...item, acao: "remover" } : item
      );

    setForm({ ...form, imagens: updatedImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imagens = [];
      if (form.imagens && form.imagens.length > 0) {
        imagens = await uploadImagens(form.imagens);
      }

      const payload = {
        nome: form.nome,
        aparelho_id: form.aparelho_id,
        cor: form.cor,
        descricao: form.descricao,
        preco: parseFloat(form.preco),
        categoria_id: form.categoria_id,
        material: form.material,
        estoque: form.estoque,
        destaque: form.destaque,
        peso: form.peso,
        altura: form.altura,
        largura: form.largura,
        comprimento: form.comprimento,
        imagens,
      };

      
      if (editandoId) {
        await api.put(`/produtos/edit/${editandoId}`, payload);
      } else {
        await api.post('/produtos/add', payload);
      }

      reset()
    } catch (err) {
        const msg = err.response?.data?.erros?.[0]?.msg || err.message || "Erro inesperado";
        setErro(msg);
        console.error('Erro ao salvar produto:', err);
    }
  };

  const reset = () => {
    setForm({nome: '', aparelho_id: '', cor: '', descricao: '', preco: '', categoria_id: '', material: '', estoque: '', destaque: '', peso: '', altura: '', largura: '', comprimento: '', imagens: []});
    setEditandoId(null);
    setErro('');
    buscarProdutos();
  };

  const handleEditar = (produto) => {
    setForm({
      nome: produto.nome,
      aparelho_id: produto.aparelho_id,
      cor: produto.cor,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria_id: produto.categoria_id,
      material: produto.material,
      estoque: produto.estoque,
      destaque: produto.destaque,
      peso: produto.peso,
      altura: produto.altura,
      largura: produto.largura,
      comprimento: produto.comprimento,
      imagens:
        produto.imagens.map(img => ({
          id: img.id,
          url: img.url,
          acao: "manter"
      }))
    });

    setEditandoId(produto.id);
    setFormAberto(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
    try {
      await api.delete(`/produtos/del/${id}`);
      buscarProdutos();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao deletar produto"); 
      console.error('Erro ao deletar produto:', err);
    }
  };

  const proximaImagem = (produtoId, imagens) => {
    setIndiceImagem(prev => ({
      ...prev,
      [produtoId]: ((prev[produtoId] || 0) + 1) % imagens.length
    }));
  };

  const imagemAnterior = (produtoId, imagens) => {
    setIndiceImagem(prev => ({
      ...prev,
      [produtoId]: ((prev[produtoId] || 0) - 1 + imagens.length) % imagens.length
    }));
  };
  
  const ModalProduto = ({ produto, onClose }) => {
    if (!produto) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          
          <button className="modal-close" onClick={onClose}>X</button>

          <h2>{produto.nome} <span style={{ fontSize: '1rem' }}>#{produto.id}</span></h2>

          <div className='modal-info' style={{ marginBottom: '10px' }}>
            <p><strong>Aparelho:</strong> {produto.aparelho_nome}</p>
            <p><strong>Categoria:</strong> {produto.categoria_nome}</p>
            <p><strong>Descrição:</strong> {produto.descricao}</p>
          </div>

          <div className='modal-dms-info'>
            <div className='modal-info'>
              <p><strong>Altura:</strong> {produto.altura}</p>
              <p><strong>Comprimento:</strong> {produto.comprimento}</p>
              <p><strong>Largura:</strong> {produto.largura}</p>
              <p><strong>Peso:</strong> {produto.peso}</p>
            </div>
            <div className='modal-info'>
              <p><strong>Material:</strong> {produto.material}</p>
              <p><strong>Cor:</strong> {produto.cor}</p>
              <p><strong>Estoque:</strong> {produto.estoque}</p>
              <p><strong>Destaque:</strong> {produto.destaque}</p>
            </div>
          </div>
          <div className='modal-info'>
            <p className="tag-preco"><strong>Preco:</strong> {produto.preco}</p>
          </div>

          <div className="modal-imgs">
            {produto.imagens?.map((img, i) => (
              <img key={i} src={img.url} alt={produto.nome} />
            ))}
          </div>

          <div className="modal-botoes">
            <button className="btn-deletar" onClick={() => {handleDeletar(produto.id); onClose();}}>Deletar</button>
            <button className="btn-editar" onClick={() => {handleEditar(produto); onClose();}}>Editar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='admin-container'>
      {erro && <span className='erro'>{erro}</span>}
      <div className='form-btn'  onClick={() => setFormAberto(!formAberto)}>
        <h2 className='title-admin-produto'>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h2>
      </div>
      <div className={`form-wrapper ${formAberto ? 'aberto' : 'fechado'}`}>

        <form className='form-admin-produto' onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-col">
              <input className='input-admin-produto' type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleInputChange} required />
              <select name="aparelho_id" value={form.aparelho_id} onChange={handleInputChange} className='input-admin-produto'>
                <option value=''>Aparelhos</option>
                {aparelhos.map(aparelho => (
                  <option key={aparelho.id} value={aparelho.id}>{aparelho.nome}</option>
                ))}
              </select>
              <input className='input-admin-produto' type="text" name="cor" placeholder="Cor" value={form.cor} onChange={handleInputChange} required />
              <textarea className='input-admin-produto' name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="preco" placeholder="Preço" value={form.preco} onChange={handleInputChange} required />
              <select name="destaque" value={form.destaque} onChange={handleInputChange} className='input-admin-produto'>
                <option value="">Destaque</option>
                <option value='sim'>Sim</option>
                <option value='nao'>Não</option>
              </select>
            </div>

            <div className="form-col">
              <select name="categoria_id" value={form.categoria_id} onChange={handleInputChange} className='input-admin-produto'>
                <option value=''>Categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                ))}
              </select>
              <input className='input-admin-produto' type="text" name="material" placeholder="Material" value={form.material} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="estoque" placeholder="Estoque" value={form.estoque} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="peso" placeholder="Peso (g)" value={form.peso} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="altura" placeholder="Altura (cm)" value={form.altura} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="largura" placeholder="Largura (cm)" value={form.largura} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="comprimento" placeholder="Comprimento (cm)" value={form.comprimento} onChange={handleInputChange} required />
            </div>
          </div>

          {form.imagens.filter(img => img.acao !== "remover").length > 0 && (
            <div className="preview-container">
              {form.imagens.filter(img => img.acao !== "remover").map((img, index) => (
                <div key={index} className="preview-item">
                  <img src={img.url} alt={`Preview ${index}`} width={100} />
                  <button type="button" onClick={() => handleRemoveImage(index)}>X</button>
                </div>
              ))}
            </div>
          )}
          <input className='input-admin-produto' type="file" name="imagens" accept="image/*" multiple onChange={handleInputChange} />

          <button className='form-btn-admin-produto' type="submit">{editandoId ? 'Atualizar' : 'Criar'}</button>
          {editandoId ? <button className='form-btn-admin-produto-cancel' onClick={() => {reset()}} type="button">Cancelar</button> : null}
        </form>
      </div>

      <br/><br/><hr/><br/>

      <h2 className='title-admin-produto'>Lista de Produtos</h2>

      <form className='form-admin-search-produto' onSubmit={searchProdutos}>
        <input className='input-admin-search-produto' type="text" placeholder="ID, Nome, Categoria, Aparelho, Cor" value={formSearch} onChange={handleInputSearchChange} />
        <button className='form-btn-admin-search-produto' type="submit">Pesquisar</button>
        <button type="button" onClick={() => buscarProdutos(1)}>Limpar</button>
      </form>

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="cards-container">
          {produtos.map((produto) => {
            const imagens = produto.imagens || [];
            const indice = indiceImagem[produto.id] || 0;

            return(
              <div className="produto-card" key={produto.id}>
                
                <div className="produto-card-imgs">
                  {imagens?.[indice] && (
                    <div className="carousel">
                      <button
                        className="carousel-btn"
                        onClick={() => imagemAnterior(produto.id, produto.imagens)}
                      >
                        <IoIosArrowBack />
                      </button>

                      <img
                        src={produto.imagens[indiceImagem[produto.id] || 0]?.url}
                        alt="imagem produto"
                        className="carousel-img"
                        onError={(e) => e.target.src="/placeholder-img.svg"}
                      />

                      <button
                        className="carousel-btn"
                        onClick={() => proximaImagem(produto.id, produto.imagens)}
                      >
                        <IoIosArrowForward />
                      </button>
                    </div>

                  )}
                </div>

                <div className="produto-card-info">
                  <h3><span style={{ fontSize: '0.85rem' }}>#{produto.id}</span> {produto.nome}</h3>
                  <p>{produto.aparelho_nome}</p>
                  <span><strong>R$ {produto.preco}</strong></span>
                </div>

                <button className="btn-verDetalhes" onClick={() => setModalProduto(produto)}>
                  Ver detalhes
                </button>

              </div>
            );
          })}
        </div>
      )}

          <div className="paginacao">
            <button disabled={page === 1} onClick={() => buscarProdutos(page - 1)}>
              Anterior
            </button>

            <span>Página {page} de {totalPaginas}</span>

            <button disabled={page === totalPaginas} onClick={() => buscarProdutos(page + 1)}>
              Próxima
            </button>
          </div>
      <ModalProduto produto={modalProduto} onClose={() => setModalProduto(null)} />
    </div>
  );
};

export default AdminProdutos;
