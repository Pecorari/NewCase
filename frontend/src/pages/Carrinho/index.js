import React from "react";

import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";

import { useNavigate } from 'react-router-dom';
import capaDestaque from "../../utils/capaDestaque1.png";

import "./carrinho.css";

const Carrinho = () => {
  const navigate = useNavigate();
  return (
    <div className="carrinho">
      <Header />
      <button className="btn-voltar-carrinho" onClick={() => navigate(-1)}>&larr; Voltar</button>
      <div className="carrinho-container">
        <h2>Seu Carrinho</h2>

        <div className="carrinho-itens">

          <div className="item">
            <img src={capaDestaque} alt="Produto" className="produto-img" />
            <span className="nome">Capinha Transparente Samsung</span>
            <span className="preco-carrinho">R$ 49,90</span>
            <button className="remover">Remover</button>
          </div>
          
        </div>

        <div className="total">
          <strong>Total: R$ 200,00</strong>
          <button className="finalizar">Finalizar Compra</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Carrinho;
