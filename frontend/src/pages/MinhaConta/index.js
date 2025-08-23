import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../hooks/useApi';
import { useAuth } from "../../context/AuthContext";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ModalNovoEndereco from '../../components/ModalNovoEndereco';
import CustomModal from '../../components/Modal/CustomModal';

import './minhaConta.css';

const MinhaConta = () => {
  const { usuario, logout } = useAuth();
  const [form, setForm] = useState({
    nome: usuario.nome,
    cpf: usuario.cpf,
    telefone: usuario.telefone,
    data_nasc: formatDateGet(usuario.data_nasc),
    email: usuario.email,
  });
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [modalSaveEndOpen, setModalSaveEndOpen] = useState(false);
  const [modalDeleteEndOpen, setModalDeleteEndOpen] = useState(false);
  const [modalDadosUpdtOpen, setModalDadosUpdtOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    listarEnderecos();
    listarPedidos();
  }, []);

  async function listarEnderecos() {
    try {
      const result = await api.get('/enderecos');

      setEnderecos(result.data);
    } catch (error) {
      console.log('erro ao listar endereços:', error)
    }
  };
  async function listarPedidos() {
    try {
      const result = await api.get('/pedidos');
      setPedidos(result.data);
    } catch (error) {
      console.log('erro ao listar pedidos:', error)
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDadosSubmit = async(e) => {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone,
      data_nasc: formatDateSend(form.data_nasc)
    }

    try {
      await api.put('/usuarios/edit/', payload);

    } catch (error) {
      console.log('erro ao editar user:', error);
    }
    setModalDadosUpdtOpen(true);
  };

  const handleSenhaSubmit = async(e) => {
    e.preventDefault();
    setErro('');

    try {
      const res = await api.put("/usuarios/alterar-senha", {senhaAtual, novaSenha});
      setSenhaAtual('');
      setNovaSenha('');
      setMensagem(res.data.mensagem);
    } catch (error) {
      console.log('Erro ao alterar a senha', error)
      setErro(error?.response?.data?.erros?.[0]?.msg || error.response.data.errors);
    }
  };

  const editarEndereco = async (endereco) => {
    await api.put(`/enderecos/edit/${enderecoSelecionado.id}`, endereco);

    listarEnderecos();
    setModalSaveEndOpen(false);
  };

  const handleRemoverEndereco = async (id) => {
    try {
      await api.delete(`/enderecos/del/${id}`);
      listarEnderecos();
      setModalDeleteEndOpen(false);
    } catch (error) {
      console.log('erro ao remover o endereço:', error);
    }
  };

  const salvarEndereco = async (endereco) => {
    await api.post('/enderecos/add', endereco);

    listarEnderecos();
    setModalSaveEndOpen(false);
  };

  function formatDateGet(dateTime) {
    const date = new Date(dateTime);
    return date.toISOString().split("T")[0];
  }

  function formatDateSend(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatarDataHora(isoString) {
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
  
    return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
  }

  return (
    <div className='minha-conta'>
      <Header />
      <div className="minha-conta-container">
        <h1 className='h1-account'>Minha Conta</h1>
        <div className='boxes'>
          <div className='meus-dados'>
            <div className='perfil-section'>
              <h3 className='h3-account'>Meus Dados</h3>
              <form onSubmit={handleDadosSubmit} className="form-usuario">
                <label className='label-account'>Nome: </label>
                  <input className='input-account' type="text" name="nome" value={form.nome} onChange={handleChange} />
                <label className='label-account'>CPF: </label>
                  <input className='input-account' type="text" name="cpf" value={form.cpf} onChange={handleChange} />
                <label className='label-account'>Telefone: </label>
                  <input className='input-account' type="text" name="telefone" value={form.telefone} onChange={handleChange} />
                <label className='label-account'>Data de Nascimento: </label>
                  <input className='input-account' type="date" name="data_nasc" value={form.data_nasc} onChange={handleChange} />
                <label className='label-account'>Email: </label>
                  <input className='input-account disabled' type="email" value={form.email} disabled />
                <br />
                <button type="submit" className='submit'>Salvar Alterações</button>

                <CustomModal
                  isOpen={modalDadosUpdtOpen}
                  onClose={() => setModalDadosUpdtOpen(false)}
                  title="Dados cadastrais atualizado!"
                />
              </form>
            </div>

            <hr />

            <div className='alterarSenha-section'>
              <h3 className='h3-account'>Alterar Senha</h3>
              <form onSubmit={handleSenhaSubmit} className="form-senha">
                <div className='password'>
                  <label className='label-account lb-password'>Senha Atual:</label>
                  <input className='input-account' type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required/>
                </div>
                <div className='password'>
                  <label className='label-account lb-password'>Nova Senha:</label>
                  <input className='input-account' type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required/>
                </div>
                  
                  {mensagem ? <p style={{ color: 'green' }}>{mensagem}</p> : <></>}
                  {erro ? <p style={{ color: 'red' }}>{erro}</p> : <></>}
                <button type="submit" className='submit'>Alterar Senha</button>
              </form>
            </div>

            <hr />

            <div className='endereco-section'>
              <h3 className='h3-account'>Meus Endereços</h3>
              <div className="enderecos">
                {enderecos.length === 0 ?
                  <p style={{ marginBottom: '10px', marginLeft: '10px' }}>Você ainda não tem um endereço cadastrado.</p>
                : enderecos.map((end) => (
                  <>
                  <div key={end.id} className="endereco-card">
                    <p>{end.rua}, {end.numero} - {end.bairro}</p>
                    <p>{end.cidade} / {end.estado}</p>
                    <p>CEP: {end.cep}</p>
                    {end.complemento ? <p>Complemento: {end.complemento}</p> : <></>}
                    <button onClick={() => {setEnderecoSelecionado(end); setModalSaveEndOpen(true)}} className='submit-endereco'>Editar</button>
                    <button onClick={(e) => {e.preventDefault(); setModalDeleteEndOpen(true);}} className='submit-endereco'>Remover</button>
                  </div>

                  <CustomModal
                    isOpen={modalDeleteEndOpen}
                    onClose={() => setModalDeleteEndOpen(false)}
                    title="Confirmar exclusão"
                    confirmText="Confirmar"
                    onConfirm={() => handleRemoverEndereco(end.id)}
                  >
                    <p>Você tem certeza que deseja excluir esse endereço?</p>
                  </CustomModal>
                  </>
                ))}
                <button onClick={() => {setEnderecoSelecionado(null); setModalSaveEndOpen(true)}} className="btn-add-endereco">+ Adicionar Endereço</button>
                {modalSaveEndOpen && (
                  <ModalNovoEndereco enderecoInicial={enderecoSelecionado} onSave={(enderecoSelecionado ? editarEndereco : salvarEndereco)} onCancel={() => { setModalSaveEndOpen(false); setEnderecoSelecionado(null); }}/>
                )}
              </div>
            </div>
            <hr />
          </div>

          <div className='meus-pedidos'>
            <h3 className='h3-account'>Pedidos</h3>
            <div className="pedidos">
              {pedidos.length === 0 ?
                <p style={{ marginBottom: '10px', marginLeft: '10px' }}>Você ainda não fez um pedido.</p>
              : pedidos.map((pedido) => (
                <div key={pedido.id} className={'pedido-card'} onClick={() => {navigate(`/pedido/${pedido.id}`)}}>
                  <div className='pedido-box'>
                    <p><strong>Pedido #{pedido.id}</strong></p>
                    <p>Total: {pedido.total}</p>
                  </div>
                  <div className='pedido-box'>
                    <p>Data: {formatarDataHora(pedido.criado_em)}</p>
                    <p>Status: {pedido.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={logout} className="btn-logout">Sair da Conta</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MinhaConta;
