import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { BsBag, BsSearch } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import { useAuth } from "../../context/AuthContext";
import { useCarrinho } from '../../context/CarrinhoContext';
import logoMyCellStore from '../../assets/utils/logo/logo_nome2.png';
import api from '../../hooks/useApi';

import "./header.css";

function Header({ inLoja }) {
  const { usuario } = useAuth();
  const { qtdCarrinho } = useCarrinho();
  const location = useLocation();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const logoRef = useRef(null);
  const dashBtnRef = useRef(null);
  const searchRef = useRef(null);
  const iconUserRef = useRef(null);
  const nameUserRef = useRef(null);
  const headerRef = useRef(null);
  const subHeaderRef = useRef(null);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (busca.trim() !== "") {
        api.get(`/produtos/search?busca=%${busca}%`)
          .then(res => setSugestoes(res.data))
          .catch(() => setSugestoes([]));
      } else {
        setSugestoes([]);
      }
    }, 100);
    return () => clearTimeout(delayDebounce);
  }, [busca]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 10) {
        logoRef.current?.classList.add('scrolled');
        searchRef.current?.classList.add('scrolled');
        headerRef.current?.classList.add('scrolled');

        if (currentScrollY > 10 && inLoja) {
          searchRef.current?.classList.add('in-loja');
          dashBtnRef.current?.classList.add('in-loja');
          iconUserRef.current?.classList.add('iconUser-logged-inLoja');
          nameUserRef.current?.classList.add('nameUser-logged-inLoja');
        } else {
          searchRef.current?.classList.remove('in-loja');
          dashBtnRef.current?.classList.remove('in-loja');
          iconUserRef.current?.classList.remove('iconUser-logged-inLoja');
          nameUserRef.current?.classList.remove('nameUser-logged-inLoja');
        }

        if (currentScrollY > 150  && currentScrollY > lastScrollY) {
          // Scrolling down
          subHeaderRef.current?.classList.add('merge');
        } else {
          // Scrolling up
          subHeaderRef.current?.classList.remove('merge');
        }
        
        subHeaderRef.current?.classList.add('scrolled');
      } else {
        logoRef.current?.classList.remove('scrolled');
        searchRef.current?.classList.remove('scrolled');
        iconUserRef.current?.classList.remove('iconUser-logged-inLoja');
        nameUserRef.current?.classList.remove('nameUser-logged-inLoja');
        headerRef.current?.classList.remove('scrolled');
        subHeaderRef.current?.classList.remove('scrolled', 'merge');
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [inLoja]);

  const handleSelectSugestao = (id) => {
    setBusca("");
    setSugestoes([]);
    setMostrarSugestoes(false);
    navigate(`/produtos/${id}`);
  };

  return (
    <header className="header">
      <div className="box-nav-actions" ref={headerRef}>
        
        <div className="logo-area"  ref={logoRef}>
          <Link to="/">
            <img src={logoMyCellStore} className="logo" alt="logo" />
          </Link>
        </div>

        {usuario?.tipo === 'admin' && <button className='btn-entrar-dashboard' onClick={() => navigate('/admin')} ref={dashBtnRef}>Dashboard</button>}

        <div className="top-bar">
          <div className="actions">
            <div className="search"  ref={searchRef}>
              <input placeholder="Buscar" type="text" value={busca} className="search-header"
                onChange={(e) => {setBusca(e.target.value); setMostrarSugestoes(true);}}
                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                onFocus={() => busca && setMostrarSugestoes(true)}
              />
              <BsSearch className="search-icon"/>

              {mostrarSugestoes && sugestoes.length > 0 && (
                <ul className="sugestoes-list">
                  {sugestoes.map((item) => (
                    <li key={item.id} onClick={() => handleSelectSugestao(item.id)}>
                      {item.nome} <br/> {item.aparelho}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {usuario ? (
              <Link to="/perfil" className="loginLogged">
                <FiUser className="iconUser" ref={iconUserRef} />
                <p className="account-user" ref={nameUserRef}>Olá,  {usuario.tipo === 'admin' ? 'Admin' : usuario.nome.split(" ")[0]}<IoIosArrowForward style={{ fontSize: '1rem' }}/></p>
              </Link>
            ) : (
              <Link to="/login" className="loginIcon">
                <p className="login-span">Entrar</p>
                <MdLogin className="iconLogin"/>
              </Link>
            )}

            <Link to="/carrinho" className="cart">
              <BsBag className="iconCart"/>
              <p className="cart-count">{qtdCarrinho}</p>
            </Link>
          </div>
        </div>

      </div>
      
      <div className="nav" ref={subHeaderRef}>
        <Link to="/" className={isActive('/')}>Início</Link>
        <Link to="/sobre" className={isActive('/sobre')}>Sobre</Link>
        <Link to="/loja" className={isActive('/loja')}>Loja</Link>
        <Link to="/perguntas" className={isActive('/perguntas')}>Perguntas Frequentes</Link>
        <Link to="/contato" className={isActive('/contato')}>Contato</Link>
      </div>
    </header>
  );
}

export default Header;
