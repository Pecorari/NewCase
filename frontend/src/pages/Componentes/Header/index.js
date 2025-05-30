import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import { BsBag, BsSearch } from "react-icons/bs";
import { useAuth } from "../../../context/AuthContext";
import { useCarrinho } from '../../../context/CarrinhoContext';
import logoMyCellStore from '../../../utils/logo_semFundo.png'
import api from '../../../hooks/useApi';

import "./header.css";

function Header() {
  const { usuario } = useAuth();
  const { qtdCarrinho } = useCarrinho();
  const location = useLocation();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

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

  const handleSelectSugestao = (id) => {
    setBusca("");
    setSugestoes([]);
    setMostrarSugestoes(false);
    navigate(`/produtos/${id}`);
  };

  return (
    <header className="header">
      <div className="logo-area">
        <Link to="/">
          <img src={logoMyCellStore} className="logo"/>
        </Link>
      </div>

      <div className="box-nav-actions">
        <div className="top-bar">
          <div className="actions">
            <div className="search">
              <input placeholder="Buscar" type="text" value={busca}
                onChange={(e) => {setBusca(e.target.value); setMostrarSugestoes(true);}}
                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                onFocus={() => busca && setMostrarSugestoes(true)}
              />
              <BsSearch className="search-icon"/>

              {mostrarSugestoes && sugestoes.length > 0 && (
                <ul className="sugestoes-list">
                  {sugestoes.map((item) => (
                    <li key={item.id} onClick={() => handleSelectSugestao(item.id)}>
                      {item.nome} <br/> {item.aparelho} - {item.cor}
                    </li>
                  ))}
                </ul>
              )}

            </div>
            {usuario ? (
              <Link to="/perfil" className="loginIcon">
                <p style={{ fontWeight: 600, fontSize: 16 }}>Olá, {usuario.nome.split(" ")[0]}</p>
              </Link>
            ) : (
              <Link to="/login" className="loginIcon">
                <MdLogin fontSize={25} />
                <span>Login</span>
              </Link>
            )}
            <Link to="/carrinho" className="cart">
              <BsBag fontSize={27} />
              <p className="cart-count">{qtdCarrinho}</p>
            </Link>
          </div>
        </div>

        <nav className="nav">
          <Link to="/" className={isActive('/')}>Início</Link>
          <Link to="/sobre" className={isActive('/sobre')}>Sobre</Link>
          <Link to="/loja" className={isActive('/loja')}>Loja</Link>
          <Link to="/perguntas" className={isActive('/perguntas')}>Perguntas Frequentes</Link>
          <Link to="/contato" className={isActive('/contato')}>Contato</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
