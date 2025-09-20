import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './login.css';

import { useAuth } from "../../context/AuthContext";

function Login() {
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    email: '',
    senha: ''
  });

  const { login } = useAuth();
  
  const navigate = useNavigate();
  
  const userLogin = async (e) => {
    e.preventDefault();
    
    try {
      await login(form.email, form.senha);
      
      console.log('Login foi um sucesso!');
      setForm({email: '', senha: ''});
      navigate('/loja');
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao realizar o login');
      console.error('Erro ao logar:', err);
    }
  }

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setErro('');
    setForm({ ...form, [name]: value });
  }

  return (
    <div className='loginPage'>
      <Header />
      <section className="login-section">
        <div className="login-container">
          <h2>Faça o Login</h2>

          <form className="login-form" onSubmit={userLogin}>
            <input type="email" name='email' value={form.email} onChange={handleInputChange} placeholder="Seu e-mail" autoComplete='email' required />
            <input type="password" name='senha' value={form.senha} onChange={handleInputChange} placeholder="Sua senha" autoComplete='current-password' required />

            {erro ? <p className='erro'>{erro}</p> : <></>}

            <button type="submit">Entrar</button>

            <div className='login-footer'>
              <Link to="/esqueci-senha">Esqueceu a senha?</Link>
              <span>|</span>
              <Link to="/cadastro">Cadastre-se agora</Link>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Login;
