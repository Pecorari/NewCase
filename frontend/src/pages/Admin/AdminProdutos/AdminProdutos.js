import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

import { storage } from '../../../services/firebase';
import api from '../../../hooks/useApi';

import './AdminProdutos.css';

const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
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
    imagens: [],
  });
  const [editandoId, setEditandoId] = useState(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagens') {
      const newFiles = Array.from(files);
    
      const updatedImages = [...form.imagens, ...newFiles];
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      const updatedPreviews = [...previews, ...newPreviews];
  
      setForm({ ...form, imagens: updatedImages });
      setPreviews(updatedPreviews);
      // const previewUrls = Array.from(files).map(file => URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadImagens = async (imagens) => {
    const urls = [];
    for (const imagem of imagens) {
      const nomeArquivo = `produtos/${uuidv4()}-${imagem.name}`;
      const imagemRef = ref(storage, nomeArquivo);
      await uploadBytes(imagemRef, imagem);
      const url = await getDownloadURL(imagemRef);
      urls.push(url);
    }
    return urls;
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = form.imagens.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
  
    setForm({ ...form, imagens: updatedImages });
    setPreviews(updatedPreviews);
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
        imagens,
      };

      if (editandoId) {
        await api.put(`/produtos/edit/${editandoId}`, payload);
      } else {
        await api.post('/produtos/add', payload);
      }

      reset()
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao salvar produto:', err);
    }
  };

  const reset = () => {
    setForm({nome: '', aparelho_id: '', cor: '', descricao: '', preco: '', categoria_id: '', estoque: '', destaque: '', imagens: []});
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
      imagens: [],
    });

    setPreviews(produto.imagens || []);
    setEditandoId(produto.id);
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
    try {
      await api.delete(`/produtos/del/${id}`);
      buscarProdutos();
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao deletar produto:', err);
    }
  };

  return (
    <div className='admin-container'>
      {erro && <span className='erro'>{erro}</span>}
      <div className='form-btn'  onClick={() => setFormAberto(!formAberto)}>
        <h2 className='title-admin-produto'>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h2>
      </div>
      <div className={`form-wrapper ${formAberto ? 'aberto' : 'fechado'}`}>
        <form className='form-admin-produto' onSubmit={handleSubmit}>
          <input className='input-admin-produto' type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleInputChange} required />
          <input className='input-admin-produto' type="number" name="aparelho_id" placeholder="Aparelho" value={form.aparelho_id} onChange={handleInputChange} required />
          <input className='input-admin-produto' type="text" name="cor" placeholder="Cor" value={form.cor} onChange={handleInputChange} required />
          <input className='input-admin-produto' type="text" name="descricao" placeholder="descrição" value={form.descricao} onChange={handleInputChange} required />
          <input className='input-admin-produto' type="number" name="preco" placeholder="Preço" value={form.preco} onChange={handleInputChange} required />
          <input className='input-admin-produto' type="number" name="categoria_id" placeholder="Categoria" value={form.categoria_id} onChange={handleInputChange} required />
          <input className='input-admin-produto' type="number" name="estoque" placeholder="Estoque" value={form.estoque} onChange={handleInputChange} required />
          <select name="destaque" value={form.destaque} onChange={handleInputChange} className='input-admin-produto'>
            <option value="">Destaque</option>
            <option value='sim'>Sim</option>
            <option value='nao'>Não</option>
          </select>
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
          {editandoId ? <button className='form-btn-admin-produto-cancel' onClick={() => {reset()}} type="reset">Cancelar</button> : <></>}
        </form>
      </div>

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-produto'>Lista de Produtos</h2>
      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <ul className='ul-admin-produto'>
          {produtos.map((produto) => (
            <li className='li-admin-produto' key={produto.id}>
              {produto.imagens && produto.imagens.length > 0 && (
                <img className='img-admin-produto' src={produto.imagens[0]} alt={produto.nome} />
              )}
              <p className='dados-produtos'>ID:<br/>{produto.id}</p>|
              <p className='dados-produtos'>Nome:<br/>{produto.nome}</p>|
              <p className='dados-produtos'>Aparelho:<br/>{produto.aparelho_id}</p>|
              <p className='dados-produtos'>Cor:<br/>{produto.cor}</p>|
              <p className='dados-produtos'>Descricao:<br/>{produto.descricao}</p>|
              <p className='dados-produtos'>Preço:<br/>R$ {produto.preco}</p>|
              <p className='dados-produtos'>Categoria_id:<br/>{produto.categoria_id}</p>|
              <p className='dados-produtos'>Estoque:<br/>{produto.estoque}</p>|
              <p className='dados-produtos'>Destaque:<br/>{produto.destaque}</p>
              <div className='containerBtn-produtos-admin'>
                <button className='li-btn-admin-produto' onClick={() => handleEditar(produto)}>Editar</button>
                <button className='li-btn-admin-produto' onClick={() => handleDeletar(produto.id)}>Deletar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminProdutos;
