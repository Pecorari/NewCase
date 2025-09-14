import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ModalNovoEndereco from '../../components/ModalNovoEndereco';

import { FcSimCardChip } from "react-icons/fc";
import { FaRegCreditCard, FaLock } from "react-icons/fa6";

import { Stepper } from 'react-form-stepper';
import { IMaskInput } from "react-imask";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calcularFrete } from '../../services/freteService';
import { useCarrinho } from '../../context/CarrinhoContext';
import api from '../../hooks/useApi';

import "./checkout.css";

const Checkout = () => {
  const { usuario } = useAuth();
  const { atualizarQtdCarrinho  } = useCarrinho();
  const [step, setStep] = useState(0);
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
  const [metodo, setMetodo] = useState("cartao");
  const [numeroCard, setNumeroCard] = useState("");
  const [nomeCard, setNomeCard] = useState("");
  const [validadeCard, setValidadeCard] = useState("");
  const [cvvCard, setCvvCard] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [statusPagamento, setStatusPagamento] = useState(null);
  const [mensagemErro, setMensagemErro] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchKey() {
      try {
        const result = await api.get("/checkout/publicKey");

        setPublicKey(result.data)
      } catch (err) {
        console.error("Erro ao buscar public key", err);
      }
    }
    fetchKey();

    const script = document.createElement("script");
    script.src = "https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js";
    script.async = true;
    document.body.appendChild(script);

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

      const subTotal = produtos.reduce((acc, p) => acc + Number(p.preco) * Number(p.quantidade), 0);

      const fretesCalculados = await calcularFrete({
        cep_destino: cep.replace(/\D/g, ''),
        peso: pacote.peso,
        comprimento: pacote.comprimento,
        altura: pacote.altura,
        largura: pacote.largura,
        valor: subTotal
      });

      setFretes(fretesCalculados);

    } catch (err) {
      console.error("Erro ao buscar fretes:", err);
    }
  };

  const checkout = async (cartaoEncriptado) => {
    try {
      const valorFrete = Number(freteSelecionado?.price?.toString().replace(',', '.') || 0);
      const subTotal = produtos.reduce((acc, p) => acc + Number(p.preco) * Number(p.quantidade), 0);
      const totalComFrete = Number((subTotal + valorFrete).toFixed(2));

      const cepFormatado = Number(enderecoSelecionado.cep.replace(/\D/g, ""));

      const dataPedido = {
        total: totalComFrete,
        endereco_rua: enderecoSelecionado.rua,
        endereco_numero: Number(enderecoSelecionado.numero),
        endereco_bairro: enderecoSelecionado.bairro,
        endereco_cidade: enderecoSelecionado.cidade,
        endereco_estado: enderecoSelecionado.estado,
        endereco_cep: cepFormatado,
        endereco_complemento: enderecoSelecionado.complemento,
        frete_nome: freteSelecionado.name,
        frete_logo: freteSelecionado.company?.picture || "",
        frete_valor: valorFrete,
        frete_prazo: freteSelecionado.delivery_time,
      };

      const itens = produtos.map((p) => ({
        produto_id: Number(p.produto_id),
        preco_unitario: Number(p.preco),
        quantidade: Number(p.quantidade),
      }));

      const payload = {
        dataPedido,
        itens,
        metodo,
        cliente: userData,
        endereco_entrega: enderecoSelecionado,
        pagamento: {}
      };

      if (metodo === "cartao") {
        payload.pagamento = {
          encrypted: cartaoEncriptado,
          titular: nomeCard
        };
      } else if (metodo === "boleto") {
        payload.pagamento = { tipo: "boleto" };
      } else if (metodo === "pix") {
        payload.pagamento = { tipo: "pix" };
      }

      const response = await api.post("/checkout", payload);

      return response.data;
    } catch (err) {
      if (err.response?.data?.error_messages) {
        const mensagens = err.response.data.error_messages
          .map(e => `${e.parameter_name || ''} - ${e.description}`)
          .join("\n");
        throw new Error(mensagens);
      }

      throw new Error("Erro inesperado ao gerar checkout.");
    }
  };

  const encryptCard = async () => {
    const erro = validarCartao({ numeroCard, nomeCard, validadeCard, cvvCard });

    if (erro) {
      setStatusPagamento("error");
      setMensagemErro(erro);
      throw new Error(erro);
    }

    const [mes, ano] = validadeCard.split('/');
    const onlyDigits = s => s.replace(/\D/g, '');

    const card = window.PagSeguro.encryptCard({
      publicKey,
      holder: nomeCard,
      number: onlyDigits(numeroCard),
      expMonth: onlyDigits(mes),
      expYear: `20${onlyDigits(ano)}`,
      securityCode: onlyDigits(cvvCard),
    });

    if (card.hasErrors) {
      const msgs = card.errors.map(e => `${e.code}: ${e.message}`).join(' | ');
      throw new Error(`Falha ao criptografar: ${msgs}`);
    }

    const encryptedCard = card.encryptedCard;

    return encryptedCard;
  };

  function validarCartao({ numeroCard, nomeCard, validadeCard, cvvCard }) {
    const onlyDigits = (s) => s.replace(/\D/g, "");

    const numeroLimpo = onlyDigits(numeroCard);
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
      return "Número do cartão inválido.";
    }

    if (!nomeCard || nomeCard.trim().length < 3 || !nomeCard.includes(" ")) {
      return "Informe o nome completo do titular.";
    }

    if (!/^\d{2}\/\d{2}$/.test(validadeCard)) {
      return "Validade inválida. Use MM/AA.";
    }
    const [mes, ano] = validadeCard.split("/").map((v) => parseInt(v, 10));
    const dataAtual = new Date();
    const anoAtual = parseInt(dataAtual.getFullYear().toString().slice(-2), 10);
    const mesAtual = dataAtual.getMonth() + 1;

    if (mes < 1 || mes > 12) {
      return "Mês da validade inválido.";
    }
    if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
      return "Cartão expirado.";
    }

    const cvvLimpo = onlyDigits(cvvCard);
    if (cvvLimpo.length < 3 || cvvLimpo.length > 4) {
      return "CVV inválido.";
    }

    return null;
  }

  const finalizarCompra = async () => {
    try {
      setStatusPagamento("loading");
      setMensagemErro("");

      let cartaoEncriptado = null

      if (metodo === 'cartao') {
        cartaoEncriptado = await encryptCard();
      }

      const response = await checkout(cartaoEncriptado);
      console.log(response);

      const statusPag = response?.dadosOrder?.charges?.[0]?.status;
      const codePag = response?.dadosOrder?.charges?.[0]?.payment_response?.code;
      
      if (statusPag === "DECLINED" ||codePag === "10002") {
        setStatusPagamento("error");
        setMensagemErro(response?.dadosOrder?.charges[0].payment_response?.message || "Pagamento recusado");
        setTimeout(() => setStatusPagamento(null), 5000);
        return;
      }
      
      setStatusPagamento("success");

      setTimeout(async () => {
        await api.delete("/carrinho/limpar");
        setProdutos([]);
        atualizarQtdCarrinho();
        navigate(`/pedido/${response.pedido.id}`);
      }, 1500); // espera 1.5s para mostrar o check animado
    
    } catch (err) {
      console.error("Erro ao finalizar compra:", err.message);
      setMensagemErro(err.message || "Erro ao processar pagamento");
      setStatusPagamento("error");
      setTimeout(() => setStatusPagamento(null), 3000);
    }
  };

  return (
    <div className="checkout">
      <Header />

      <div className="checkout-container">
        <button className="btn-voltar-checkout" onClick={() => navigate(-1)}>&larr; Voltar</button>
        <div className="checkout-box">
          <div className="p-8">
            <Stepper
              steps={[
                { label: "Dados Pessoais" },
                { label: "Escolha o Endereço" },
                { label: "Escolha o Frete" },
                { label: "Pagamento" }
              ]}
              activeStep={step}
              styleConfig={{
                activeBgColor: "#ff007f",
                activeTextColor: "#fff",
                completedBgColor: "#FF6EC7",
                completedTextColor: "#fff",
                inactiveBgColor: "#e5e7eb",
                inactiveTextColor: "#5c626dff",
                size: "2.5em",
                circleFontSize: "1rem"
              }}
            />
          </div>

          {/* Etapa 1 - Dados pessoais */}
          {step === 0 && (
            <div className="checkout-step">
              <form className="form-checkout" onSubmit={(e) => {
                  e.preventDefault();
                  if (!userData.nome.trim()) return alert("Preencha seu nome");
                  if (userData.cpf.length !== 14) return alert("CPF inválido");
                  if (!/\S+@\S+\.\S+/.test(userData.email)) return alert("E-mail inválido");
                  if (userData.telefone.length < 14) return alert("Telefone inválido");

                  handleNext();
                }}>
                <label>Nome Completo:</label>
                <input type="text" value={userData.nome} placeholder="Nome completo" onChange={(e) => setUserData({ ...userData, nome: e.target.value })} required/>

                <label>CPF:</label>
                <IMaskInput mask={"000.000.000-00"} type="text" placeholder="CPF" value={userData.cpf} onAccept={value => setUserData({ ...userData, cpf: value })} required />

                <label>Email:</label>
                <input type="email" value={userData.email} placeholder="E-mail" onChange={(e) => setUserData({ ...userData, email: e.target.value })} required/>

                <label>Telefone:</label>
                <IMaskInput mask={"(00) 00000-0000"} type="text" placeholder="Telefone" value={userData.telefone} onAccept={value => setUserData({ ...userData, telefone: value })} required />
              
                <div className="checkout-buttons" style={{ marginTop: '15px' }}>
                  <button className="btn-prev" onClick={() => navigate(-1)}>Cancelar</button>
                  <button type="submit" className="btn-next">Continuar</button>
                </div>
              </form>
            </div>
          )}

          {/* Etapa 2 - Endereço */}
          {step === 1 && (
            <div className="checkout-step">

              <div className="enderecos-lista">
                {enderecos.map((end) => (
                  <div key={end.id}
                    className={`endereco-card ${enderecoSelecionado?.id === end.id ? "selecionado" : ""}`}
                    onClick={() => {
                      setEnderecoSelecionado(end);
                      setNovoEndereco(false);
                    }}
                  >
                    <strong className="title-end">{end.rua}, {end.numero} - {end.bairro}</strong>
                    <p>{end.cidade} / {end.estado}</p>
                    <p>CEP: {end.cep}</p>
                    {end.complemento ? <p>Complemento: {end.complemento}</p> : <></>}
                  </div>
                ))}

                <div className={`endereco-card add-novo ${novoEndereco ? "selecionado" : ""}`} onClick={() => {
                    setEnderecoSelecionado(null);
                    setNovoEndereco(true);
                }}>
                  + Adicionar novo endereço
                </div>
                {novoEndereco && (
                  <ModalNovoEndereco onSave={(cadastrarEndereco)} onCancel={() => {setNovoEndereco(false); setEnderecoSelecionado(null);}}/>
                )}
              </div>

              <div className="checkout-buttons">
                <button className="btn-prev" onClick={(e) => {e.preventDefault(); handlePrev();}}>Voltar</button>
                <button className="btn-next" onClick={(e) => {e.preventDefault(); handleNext(); buscarFretes(enderecoSelecionado.cep);}} disabled={!enderecoSelecionado && !novoEndereco}>
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3 - Frete */}
          {step === 2 && (
            <div className="checkout-step">

              <ul className="frete-opcoes">
                {fretes.length === 0 ? (<p style={{ fontSize: '0.9rem', color: '#b8b8b8ff', marginLeft: '20px' }}>Estamos os melhores serviços de frete! ...</p>) : (
                  fretes.map((opcao, index) => (
                    <li className={`frete-item-checkout ${freteSelecionado?.id === opcao.id ? "selecionado" : ""}`} key={index} onClick={() => setFreteSelecionado(opcao)}>
                      <img src={opcao.company.picture} alt={opcao.name} className="frete-logo-checkout" />
                      <div className="frete-detalhes-checkout">
                        <h4 className="frete-title">{opcao.name}</h4>
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
                <button className="btn-prev" onClick={(e) => {e.preventDefault(); handlePrev();}}>Voltar</button>
                <button className="btn-next" onClick={(e) => {e.preventDefault(); handleNext();}} disabled={!freteSelecionado}>Continuar</button>
              </div>
            </div>
          )}

          {/* Etapa 4 - Pagamento */}
          {step === 3 && (
            <div className="checkout-step step-pagamento">
              <div className="processado-por">
                <span>Processado com segurança pelo</span>
                <img src='/bandeiras/pagbank2.svg' alt="PagBank" />
              </div>
              <div className="pagamento-opcoes">
                <div className="abas-pagamento">
                  <button className={`aba ${metodo === "cartao" ? "ativa" : ""}`} onClick={() => setMetodo("cartao")}>
                    Cartão
                  </button>
                  <button className={`aba ${metodo === "boleto" ? "ativa" : ""}`} onClick={() => setMetodo("boleto")}>
                    Boleto
                  </button>
                  <button className={`aba ${metodo === "pix" ? "ativa" : ""}`} onClick={() => setMetodo("pix")}>
                    <img src='bandeiras/pix2.svg' className="icon-pix" alt="icone do PIX" />
                    PIX
                  </button>
                </div>

                <div className="conteudo-pagamento">
                  {metodo === "cartao" && (
                    <div className="cartao-container">
                      <div className="entradas-box">
                        <div className="input-icon">
                          <IMaskInput
                            mask="0000 0000 0000 0000"
                            className="input-pagamento"
                            placeholder="Número do Cartão"
                            value={numeroCard}
                            onAccept={(value) => setNumeroCard(value)}
                          />
                          <FaRegCreditCard />
                        </div>
                        <input className="input-pagamento" type="text" placeholder="Nome no Cartão"
                          value={nomeCard}
                          onChange={(e) => setNomeCard(e.target.value.toUpperCase())}
                        />
                        <IMaskInput
                          mask="00/00"
                          className="input-pagamento"
                          placeholder="Validade (MM/AA)"
                          value={validadeCard}
                          onAccept={(value) => setValidadeCard(value)}
                        />
                        <div className="input-icon">
                          <IMaskInput
                            mask="0000"
                            className="input-pagamento"
                            placeholder="CVV"
                            value={cvvCard}
                            onAccept={(value) => setCvvCard(value)}
                          />
                          <FaLock />
                        </div>
                        {mensagemErro ? <p className="error-feedback">{mensagemErro}</p> : <></>}
                      </div>

                      <div className="feedback-box">
                        <div className="cartao-mockup">
                          <div className="chip"><FcSimCardChip /></div>
                          <div className="numero-cartao">{numeroCard || "•••• •••• •••• ••••"}</div>
                          <div className="nome-validade">
                            <span>{nomeCard || "NOME NO CARTÃO"}</span>
                            <span className="validade">{validadeCard || "MM/AA"}</span>
                          </div>
                        </div>
                        <div className="logos-pagamento">
                          <img src='/bandeiras/visa.svg' alt="Visa" className="bandeiras" />
                          <img src='/bandeiras/mastercard.svg' alt="Mastercard" className="bandeiras" />
                          <img src='/bandeiras/elo.svg' alt="Elo" className="bandeiras" />
                          <img src='/bandeiras/hipercard.svg' alt="Hipercard" className="bandeiras" />
                          <img src='/bandeiras/hiper.svg' alt="Hiper" className="bandeiras" />
                          <img src='/bandeiras/american-express.svg' alt="American-Express" className="bandeiras" />
                          <img src='/bandeiras/diners-club.svg' alt="Diners-Club" className="bandeiras" />
                        </div>
                      </div>
                    </div>
                  )}

                  {metodo === "boleto" && (
                    <div className="pix-boleto-container">
                      <h4>O boleto será gerado após você finalizar a compra.</h4>

                      <ol className="instructions">
                        <li>Abra o PDF ou copie a linha digitável.</li>
                        <li>Pague em internet banking, app do banco, caixas eletrônicos ou lotéricas.</li>
                      </ol>
                    </div>
                  )}

                  {metodo === "pix" && (
                    <div className="pix-boleto-container">
                      <h4>O código QR / Chave PIX será gerado após você finalizar a compra.</h4>
                      
                      <ol className="instructions">
                        <li>{`Abra o app do seu banco → Área Pix`}</li>
                        <li>{`Pagar com QR → aponte a câmera para o QR ou cole o código.`}</li>
                        <li>Confirme o valor e conclua o pagamento no app.</li>
                      </ol>
                    </div>
                  )}
                </div>

                <p className="info-seguranca">
                  🔒 Não armazenamos dados do seu cartão.  
                  Seus pagamentos são processados de forma 100% segura pelo PagBank.
                </p>
              </div>

              <div className="checkout-buttons">
                <button className="btn-prev" onClick={(e) => {e.preventDefault(); handlePrev();}}>Voltar</button>
                
                <button className="btn-finalizar" onClick={() => finalizarCompra()}>Finalizar Compra</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {statusPagamento && (
        <div className="overlay"   onClick={() => {if (statusPagamento === "error") setStatusPagamento(null)}}>
          <div className="overlay-content">
            {statusPagamento === "loading" && (
              <>
                <div className="spinner"></div>
                <p className="msg">Processando pagamento...</p>
              </>
            )}

            {statusPagamento === "success" && (
              <>
                <div className="circle success">
                  <span>✔</span>
                </div>
                <p className="msg success">Pagamento confirmado!</p>
              </>
            )}

            {statusPagamento === "error" && (
              <>
                <div className="circle error">
                  <span>✖</span>
                </div>
                <p className="msg error">Erro no pagamento</p>
                <p className="msg small">{mensagemErro}</p>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
