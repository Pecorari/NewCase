import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

import { storage } from '../../../services/firebase';
import api from '../../../hooks/useApi';

import './AdminProdutos.css';

const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [formAberto, setFormAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    nome: '',
    aparelho_id: '',
    cor: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    estoque: '',
    destaque: '',
    peso: '',
    altura: '',
    largura: '',
    comprimento: '',
    imagens: [{
      id: '',
      url: '',
      acao: 'manter'
    }],
  });
  const [editandoId, setEditandoId] = useState(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    buscarProdutos(1);
  }, []);

  const buscarProdutos = async (valuePage = 1) => {
    try {
      const response = await api.get(`/produtos?page=${valuePage}`);

      console.log(response.data.produtos);
      setProdutos(response.data.produtos);
      setPage(response.data.page);
      setTotalPaginas(response.data.totalPaginas);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar produtos:', err);
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

      console.log(updatedImages);
      
      setForm({ ...form, imagens: updatedImages });
      setPreviews(updatedImages.map(img => img.url));
    } else {
      setForm({ ...form, [name]: value });
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
    const imgDel = form.imagens[indexToRemove];
    console.log('indexToRemove:', indexToRemove);
    console.log('imgDel:', imgDel);

    let updatedImages;
    if (imgDel) {
      updatedImages = form.imagens.map((item, idx) =>
        idx === indexToRemove ? { ...item, acao: "remover" } : item
      );
    } else { 
      updatedImages = form.imagens.filter((_, idx) => idx !== indexToRemove);
    }

    console.log('updatedImages:', updatedImages);
    setForm({ ...form, imagens: updatedImages });
    setPreviews(updatedImages.filter(img => img.acao !== "remover").map(img => img.url));
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
        estoque: form.estoque,
        destaque: form.destaque,
        peso: form.peso,
        altura: form.altura,
        largura: form.largura,
        comprimento: form.comprimento,
        imagens,
      };

      
      if (editandoId) {
        console.log('EDITANDO:', payload);
        await api.put(`/produtos/edit/${editandoId}`, payload);
      } else {
        console.log('CRIANDO:', payload);
        await api.post('/produtos/add', payload);
      }

      reset()
    } catch (err) {
        const msg = err.response?.data?.mensagem || err.message || "Erro inesperado";
        setErro(msg);
        console.error('Erro ao salvar produto:', err);
    }
  };

  const reset = () => {
    setForm({nome: '', aparelho_id: '', cor: '', descricao: '', preco: '', categoria_id: '', estoque: '', destaque: '', peso: '', altura: '', largura: '', comprimento: '', imagens: []});
    setEditandoId(null);
    setPreviews([]);
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

    console.log(produto);
    console.log(produto.imagens.map(img => ({
      id: img.id,
      url: img.url,
      acao: 'manter'
    })));

    setPreviews(produto.imagens.map(img => img.url));
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

  return (
    <div className='admin-container'>
      {erro && <span className='erro'>{erro}</span>}
      <div className='form-btn'  onClick={() => console.log(form)}>
        <h2 className='title-admin-produto'>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h2>
      </div>
      <div className={`form-wrapper ${formAberto ? 'aberto' : 'fechado'}`}>

        <form className='form-admin-produto' onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-col">
              <input className='input-admin-produto' type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="aparelho_id" placeholder="Aparelho" value={form.aparelho_id} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="text" name="cor" placeholder="Cor" value={form.cor} onChange={handleInputChange} required />
              <textarea className='input-admin-produto' name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="preco" placeholder="Preço" value={form.preco} onChange={handleInputChange} required />
            </div>

            <div className="form-col">
              <input className='input-admin-produto' type="number" name="categoria_id" placeholder="Categoria" value={form.categoria_id} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="estoque" placeholder="Estoque" value={form.estoque} onChange={handleInputChange} required />
              <select name="destaque" value={form.destaque} onChange={handleInputChange} className='input-admin-produto'>
                <option value="">Destaque</option>
                <option value='sim'>Sim</option>
                <option value='nao'>Não</option>
              </select>
              <input className='input-admin-produto' type="number" name="peso" placeholder="Peso (g)" value={form.peso} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="altura" placeholder="Altura (cm)" value={form.altura} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="largura" placeholder="Largura (cm)" value={form.largura} onChange={handleInputChange} required />
              <input className='input-admin-produto' type="number" name="comprimento" placeholder="Comprimento (cm)" value={form.comprimento} onChange={handleInputChange} required />
            </div>
          </div>

          {previews.length > 0 && (
            <div className="preview-container">
              {previews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <img src={preview} alt={`Preview ${index}`} width={100} />
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

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-produto'>Lista de Produtos</h2>
      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="produto-grid">
          <div className="produto-header">
            <span>Imagens</span>
            <span>ID</span>
            <span>Nome</span>
            <span>Aparelho</span>
            <span>Cor</span>
            <span>Descrição</span>
            <span>Preço</span>
            <span>Categoria</span>
            <span>Estoque</span>
            <span>Destaque</span>
            <span>Peso</span>
            <span>Altura</span>
            <span>Largura</span>
            <span>Comprimento</span>
            <span>Ações</span>
          </div>

          {produtos.map((produto) => (
            <div className="produto-row" key={produto.id}>
              <div className="produto-imagens">
                {produto.imagens?.map((img, i) => (
                  <img key={i} src={img.url} alt={produto.nome} />
                ))}
              </div>
              <span>{produto.id}</span>
              <span>{produto.nome}</span>
              <span>{produto.aparelho_id}</span>
              <span>{produto.cor}</span>
              <span>{produto.descricao}</span>
              <span>R$ {produto.preco}</span>
              <span>{produto.categoria_id}</span>
              <span>{produto.estoque}</span>
              <span>{produto.destaque}</span>
              <span>{produto.peso} g</span>
              <span>{produto.altura} cm</span>
              <span>{produto.largura} cm</span>
              <span>{produto.comprimento} cm</span>
              <div className="produto-acoes">
                <button onClick={() => handleEditar(produto)}>Editar</button>
                <button onClick={() => handleDeletar(produto.id)}>Deletar</button>
              </div>
            </div>
          ))}

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
    </div>
  );
};

export default AdminProdutos;
