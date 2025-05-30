import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp   } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import capaDestaque1 from '../../utils/capaDestaque1.png';
import colorExplosion from '../../utils/color-explosion2.jpg'
import "./home.css";

import ProdutosDestaque from "../Componentes/ProdutosDestaque/index";
import Footer from "../Componentes/Footer/index";
import Header from "../Componentes/Header/index";

function Home() {
  return (
    <div className="home">
      <Header />

      <div className="body">
        <div className="social-icons">
          <a href="/" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="/" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
          <a href="/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="/" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
        </div>

        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="title-hero">PROTEJA SEU CELULAR COM ESTILO</h1>
              <p className="subtitle-hero">Capinhas, resistentes e exclusivas <br/> com entrega rápida.</p>
              <Link to="/loja" className="hero-button">ACESSAR A LOJA</Link>
            </div>
            <div className="hero-image">
              <img src={capaDestaque1} alt="capa em destaque" className="produto-banner" />
            </div>
          </div>
          <img src={colorExplosion} alt="explosão de cores" className="backgroundImg"/>
        </section>

        <section className="produtos-destaques">
          <h2 className="titulo">PRODUTOS EM DESTAQUE</h2>
          <ProdutosDestaque />

          <h2 className="ver-mais"><Link to="/loja" className="ver-mais-a">VEJA MAIS</Link></h2>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
