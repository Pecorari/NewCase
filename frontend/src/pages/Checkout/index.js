import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ModalNovoEndereco from '../../components/ModalNovoEndereco';

import { IMaskInput } from "react-imask";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calcularFrete } from '../../services/freteService';
import api from '../../hooks/useApi';

import "./checkout.css";

const Checkout = () => {
  const { usuario } = useAuth();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    nome: usuario?.nome,
    cpf: usuario?.cpf,
    email: usuario?.email,
    telefone: usuario?.telefone,
  });
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [novoEndereco, setNovoEndereco] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [fretes, setFretes] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    listarEnderecos();
    getProdutos();
  }, []);

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  async function listarEnderecos() {
    try {
      const result = await api.get('/enderecos');

      setEnderecos(result.data);
    } catch (error) {
      console.log('erro ao listar endereços:', error)
    }
  };

  const cadastrarEndereco = async (endereco) => {
    await api.post('/enderecos/add', endereco);

    listarEnderecos();
    setNovoEndereco(false);
  };

  const getProdutos = async () => {
    try {
      const response = await api.get('/carrinho');

      setProdutos(response.data);
    } catch (error) {
      console.log('Não foi pegar os produtos do carrinho:', error);
    }
  }

  const buscarFretes = async (cep) => {
    if (!cep) return;
    if (!produtos || produtos.length === 0) return; 
    
    try {
      const pacote = produtos.reduce((acc, p) => ({
        peso: acc.peso + Number(p.peso) * Number(p.quantidade),
        comprimento: Math.max(acc.comprimento, Number(p.comprimento)),
        altura: Math.max(acc.altura, Number(p.altura)),
        largura: acc.largura + (parseFloat(p.largura.toString().replace(',', '.')) || 0)
      }), { peso: 0, comprimento: 0, altura: 0, largura: 0 });

      const valorTotalProdutos = produtos.reduce((acc, p) => acc + Number(p.preco) * Number(p.quantidade), 0);

      const fretesCalculados = await calcularFrete({
        cep_destino: cep.replace(/\D/g, ''),
        peso: pacote.peso,
        comprimento: pacote.comprimento,
        altura: pacote.altura,
        largura: pacote.largura,
        valor: valorTotalProdutos
      });

      setFretes(fretesCalculados);

    } catch (err) {
      console.error("Erro ao buscar fretes:", err);
    }
  };


  return (
    <div className="checkout">
      <Header />

      <div className="checkout-container">
        <button className="btn-voltar-checkout" onClick={() => navigate(-1)}>&larr; Voltar</button>
        <div className="checkout-box">
          <h2 className="title-checkout">Checkout</h2>

          {/* Barra de etapas */}
          <div className="steps">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1. Dados Pessoais</div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>2. Endereço</div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>3. Frete</div>
            <div className={`step ${step >= 4 ? "active" : ""}`}>4. Pagamento</div>
          </div>

          {/* Etapa 1 - Dados pessoais */}
          {step === 1 && (
            <div className="checkout-step">
              <h3>Dados Pessoais</h3>
              <form className="form-checkout" onSubmit={handleNext}>
                <label>Nome Completo:</label>
                <input type="text" value={userData.nome} placeholder="Nome completo" onChange={(e) => setUserData({ ...userData, nome: e.target.value })}/>

                <label>CPF:</label>
                <IMaskInput mask={"000.000.000-00"} type="text" placeholder="CPF" value={userData.cpf} onAccept={value => setUserData({ ...userData, cpf: value })} required />

                <label>Email:</label>
                <input type="email" value={userData.email} placeholder="E-mail" onChange={(e) => setUserData({ ...userData, email: e.target.value })}/>

                <label>Telefone:</label>
                <IMaskInput mask={"(00) 00000-0000"} type="text" placeholder="Telefone" value={userData.telefone} onAccept={value => setUserData({ ...userData, telefone: value })} required />
              </form>
              <button className="btn-next" onClick={handleNext}>
                Continuar
              </button>
            </div>
          )}

          {/* Etapa 2 - Endereço */}
          {step === 2 && (
            <div className="checkout-step">
              <h3>Escolha o Endereço de Entrega</h3>

              <div className="enderecos-lista">
                {enderecos.map((end) => (
                  <div key={end.id}
                    className={`endereco-card ${enderecoSelecionado?.id === end.id ? "selecionado" : ""}`}
                    onClick={() => {
                      setEnderecoSelecionado(end);
                      setNovoEndereco(false);
                    }}
                  >
                    <strong>{end.rua}, {end.numero} - {end.bairro}</strong>
                    <p>{end.cidade} / {end.estado}</p>
                    <p>CEP: {end.cep}</p>
                    {end.complemento ? <p>Complemento: {end.complemento}</p> : <></>}
                  </div>
                ))}

                <div className={`endereco-card add-novo ${novoEndereco ? "selecionado" : ""}`}
                  onClick={() => {
                    setEnderecoSelecionado(null);
                    setNovoEndereco(true);
                  }}
                > + Adicionar novo endereço
                </div>
                {novoEndereco && (
                  <ModalNovoEndereco onSave={(cadastrarEndereco)} onCancel={() => {setNovoEndereco(false); setEnderecoSelecionado(null);}}/>
                )}
              </div>

              <div className="checkout-buttons">
                <button className="btn-prev" onClick={handlePrev}>Voltar</button>
                <button className="btn-next" onClick={() => {handleNext(); buscarFretes(enderecoSelecionado.cep);}} disabled={!enderecoSelecionado && !novoEndereco}>
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3 - Frete */}
          {step === 3 && (
            <div className="checkout-step">
              <h3>Escolha o Frete</h3>

              <ul className="frete-opcoes">
                {fretes.length === 0 ? (<p style={{ fontSize: '0.9rem', color: '#b8b8b8ff', marginLeft: '20px' }}>Estamos os melhores serviços de frete! ...</p>) : (
                  fretes.map((opcao, index) => (
                    <li className={`frete-item ${freteSelecionado?.id === opcao.id ? "selecionado" : ""}`} key={index} onClick={() => setFreteSelecionado(opcao)}>
                      <img src={opcao.company.picture} alt={opcao.name} className="frete-logo" />
                      <div className="frete-detalhes">
                        <h4>{opcao.name}</h4>
                        {opcao.error ? (
                          <p>{opcao.error}</p>
                        ) : (
                          <p>R$ {opcao.price} - {opcao.delivery_time} dias úteis</p>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <div className="checkout-buttons">
                <button className="btn-prev" onClick={handlePrev}>Voltar</button>
                <button className="btn-next" onClick={handleNext} disabled={!freteSelecionado}>Continuar</button>
              </div>
            </div>
          )}

          {/* Etapa 4 - Pagamento */}
          {step === 4 && (
            <div className="checkout-step">
              <h3>Pagamento</h3>
              <div className="pagamento-opcoes">
                <label>
                  <input type="radio" name="pagamento" /> Cartão de Crédito
                </label>
                <label>
                  <input type="radio" name="pagamento" /> Pix
                </label>
                <label>
                  <input type="radio" name="pagamento" /> Boleto
                </label>
              </div>
              <div className="checkout-buttons">
                <button className="btn-prev" onClick={handlePrev}>Voltar</button>
                <button className="btn-finalizar">Finalizar Compra</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
