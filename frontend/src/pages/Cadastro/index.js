import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { FaRegCalendar } from "react-icons/fa";

import './cadastro.css';

import api from '../../hooks/useApi';

function Cadastro() {
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    data_nasc: '',
    email: '',
    senha: '',
    senha_confirm: ''
  });

  const navigate = useNavigate();

  const userAdd = async (e) => {
    e.preventDefault();

    if (form.senha !== form.senha_confirm) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      const result = await api.post('usuarios/add', { nome: form.nome, cpf: form.cpf, telefone: form.telefone, data_nasc: form.data_nasc, email: form.email, senha: form.senha });

      setForm({nome: '', cpf: '', telefone: '', data_nasc: '', email: '', senha: '', senha_confirm: ''});
      navigate('/cadastro/verificar-email', {state: { id: result.data.id, email: result.data.email }});
    } catch (err) {
      console.error('Erro ao criar usuario:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErro('');

    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 11) 
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
  
    if (name === 'telefone') {
      formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }

    if (name === 'data_nasc') {
      formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2');
    }

    setForm({ ...form, [name]: formattedValue });
  };

  return (
    <div className='cadastroPage'>
      <Header />
      <section className="cadastro">
        <div className="cadastro-container">
          <h2>Cadastre-se agora mesmo</h2>
          <p>Crie sua conta rápido e fácil</p>
          <form className="cadastro-form" onSubmit={userAdd}>
            <input type="text" placeholder="Nome completo" name='nome' value={form.nome} onChange={handleInputChange} required />
            <input type="email" placeholder="E-mail" name='email' value={form.email} onChange={handleInputChange} autoComplete='email' required />
            <input type="text" placeholder="CPF" name='cpf' value={form.cpf} onChange={handleInputChange} required />
            <input type="text" placeholder="Telefone celular" name='telefone' value={form.telefone} onChange={handleInputChange} />
            <div className='data-container'>
              <input type="text" placeholder="Data de Nascimento" name='data_nasc' className='data_nasc' value={form.data_nasc} onInput={(e) => {if (e.target.value.length > 10) e.target.value = e.target.value.slice(0, 10)}} max="2025-12-31" onChange={handleInputChange} />
              <FaRegCalendar className='calendar' />
            </div>
            <input type="password" placeholder="Crie sua senha" name='senha' value={form.senha} onChange={handleInputChange} autoComplete='new-password' required />
            <input type="password" placeholder="Confirme sua senha" name='senha_confirm' value={form.senha_confirm} onChange={handleInputChange} required />

            {erro ? <span className='erro'>{erro}</span> : <></>}
            
            <button type="submit">Criar conta</button>

            <div className='cadastro-footer'>
              <Link to="/login">Já possui uma conta? Faça o Login</Link>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Cadastro;
