import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../hooks/useApi';
import { useAuth } from "../../context/AuthContext";

import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';
import ModalNovoEndereco from '../Componentes/ModalNovoEndereco'

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 

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
  const [mostrarModal, setMostrarModal] = useState(false);

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
console.log(result.data)
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

      showSuccessModal();
    } catch (error) {
      console.log('erro ao editar user:', error);
    }
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
    setMostrarModal(false);
  };

  const handleRemoverEndereco = async (id) => {
    confirmAlert({
      title: 'Confirmar exclusão',
      message: 'Você tem certeza que deseja excluir esse endereço?',
      buttons: [
        {label: 'Sim',
          onClick: async () => {
            try {
              await api.delete(`/enderecos/del/${id}`);

              listarEnderecos();
            } catch (error) {
              console.log('erro ao remover o endereço:', error);
            }
          }
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    });
  };

  const salvarEndereco = async (endereco) => {
    await api.post('/enderecos/add', endereco);

    listarEnderecos();
    setMostrarModal(false);
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

  const showSuccessModal = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 style={{ color: '#4BB543' }}>Sucesso!</h1>
            <p>Os dados foram atualizados com sucesso.</p>
            <button className='modal-btn' onClick={onClose}>OK</button>
          </div>
        );
      }
    });
  }

  return (
    <div className='minha-conta'>
      <Header />
      <div className="minha-conta-container">
        <h1 className='h1-account'>Minha Conta</h1>
        <div className='boxes'>
          <div className='meus-dados'>
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
                <input className='disabled' type="email" value={form.email} disabled />
              <br />
              <button type="submit" className='submit'>Salvar Alterações</button>
            </form>

            <hr />

            <h3 className='h3-account'>Alterar Senha</h3>
            <form onSubmit={handleSenhaSubmit} className="form-senha">
              <label className='label-account'>Senha Atual: <input className='input-account' type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required/></label>
              <label className='label-account'>Nova Senha: <input className='input-account' type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required/></label>
                {mensagem ? <p style={{ color: 'green' }}>{mensagem}</p> : <></>}
                {erro ? <p style={{ color: 'red' }}>{erro}</p> : <></>}
              <button type="submit" className='submit'>Alterar Senha</button>
            </form>

            <hr />

            <h3 className='h3-account'>Meus Endereços</h3>
            <div className="enderecos">
              {enderecos.length === 0 ?
                <p style={{ marginBottom: '10px' }}>Você ainda não tem um endereço cadastrado.</p>
              : enderecos.map((end) => (
                <div key={end.id} className="endereco-card">
                  <p>{end.rua}, {end.numero} - {end.bairro}, {end.cidade} / {end.estado}</p>
                  <p>CEP: {end.cep}</p>
                  {end.complemento ? <p>Complemento: {end.complemento}</p> : <></>}
                  <button onClick={() => {setEnderecoSelecionado(end); setMostrarModal(true)}} className='submit-endereco'>Editar</button>
                  <button onClick={() => handleRemoverEndereco(end.id)} className='submit-endereco'>Remover</button>
                </div>
              ))}
              <button onClick={() => {setEnderecoSelecionado(null); setMostrarModal(true)}} className="btn-add-endereco">+ Adicionar Endereço</button>
              {mostrarModal && (
                <ModalNovoEndereco enderecoInicial={enderecoSelecionado} onSave={(enderecoSelecionado ? editarEndereco : salvarEndereco)} onCancel={() => { setMostrarModal(false); setEnderecoSelecionado(null); }}/>
              )}
            </div>
            
            <hr />

            <button onClick={logout} className="btn-logout">Sair da Conta</button>
          </div>

          <div className='meus-pedidos'>
            <h3 className='h3-account'>Pedidos</h3>
            <div className="pedidos">
              {enderecos.length === 0 ?
                <p style={{ marginBottom: '10px' }}>Você ainda não fez um pedido.</p>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MinhaConta;
