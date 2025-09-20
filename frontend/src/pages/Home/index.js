import React from "react";
import { Link } from "react-router-dom";

import ProdutosDestaque from "../../components/ProdutosDestaque";
import RedesSociais from "../../components/RedesSociais";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import "./home.css";

function Home() {
  return (
    <div className="home">
      <Header />

      <div className="body">
        <div className="body-content">
          <section className="hero">
            <div className="hero-content">
              <div className="hero-image">
                <img src='/destaqueHome/capaDestaque1.svg' alt="capa em destaque" className="produto-banner" />
              </div>
              <div className="hero-text">
                <h1 className="title-hero">PROTEJA SEU CELULAR COM ESTILO</h1>
                <p className="subtitle-hero">Capinhas, resistentes e exclusivas <br/> com entrega rápida.</p>
                <Link to="/loja"><button className="hero-btn">ACESSAR A LOJA</button></Link>
              </div>
            </div>
            <img src='/destaqueHome/color-explosion2.svg' alt="explosão de cores" className="backgroundImg"/>
          </section>

          <section className="produtos-destaques">
            <h2 className="titulo">PRODUTOS EM DESTAQUE</h2>
            <ProdutosDestaque />

            <Link to="/loja"><button className="ver-mais-btn">VEJA MAIS</button></Link>
          </section>
        </div>
        <RedesSociais />
      </div>

      <Footer />
    </div>
  );
}

export default Home;
