import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ModalNovoEndereco from '../../components/ModalNovoEndereco';

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
  const [tipoCard, setTipoCard] = useState("credito");
  const [publicKey, setPublicKey] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [chavePix, setChavePix] = useState('');
  const [pdfBoleto, setPdfBoleto] = useState('');

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

  const gerarPedido = async () => {
    const valorFrete = Number(freteSelecionado?.price?.toString().replace(',', '.') || 0);
    const subTotal = produtos.reduce((acc, p) => acc + Number(p.preco) * Number(p.quantidade), 0);
    const totalComFrete = Number((subTotal + valorFrete).toFixed(2));

    const cepFormatado = Number(enderecoSelecionado.cep.replace(/\D/g, ""));

    try {
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
        frete_valor: Number(freteSelecionado.price),
        frete_prazo: freteSelecionado.delivery_time,
      };

      const itens = produtos.map((p) => ({
        produto_id: Number(p.produto_id),
        preco_unitario: Number(p.preco),
        quantidade: Number(p.quantidade),
      }));

      const response = await api.post("/pedidos/add", { dataPedido, itens });

      if (response.data.pedido) {
        await api.delete("/carrinho/limpar");
        setProdutos([]);
        atualizarQtdCarrinho();
        return response.data;
      } else {
        alert("Erro ao criar pedido");
      }
    } catch (err) {
      console.error("Erro ao gerar pedido:", err);
      alert("Erro ao gerar pedido, tente novamente");
    }
  };

  const gerarPagamento = async (pedidoGerado, cartaoEncriptado) => {
    const subTotal = pedidoGerado.itens.reduce((acc, p) => acc + Number(p.preco_unitario) * Number(p.quantidade), 0);
    const Total = subTotal + Number(pedidoGerado.pedido.frete_valor);

    const payload = {
      metodo,
      pedido: {
        id: pedidoGerado.pedido.id,
        itens: pedidoGerado.itens,
        subtotal: (subTotal.toFixed(2)),
        frete: pedidoGerado.pedido.frete_valor,
        total: (Total.toFixed(2))
      },
      cliente: userData,
      endereco_entrega: enderecoSelecionado,
      pagamento: {}
    }

    if (metodo === "cartao") {
      payload.pagamento.cartao = {
        tipo: tipoCard,
        encrypted: cartaoEncriptado
      };
    } else if (metodo === "boleto") {
      payload.pagamento = { tipo: "boleto" };
    } else if (metodo === "pix") {
      payload.pagamento = { tipo: "pix" };
    }
    
    const response = await api.post("/checkout/pagar", payload);

    console.log(response.data);
    return response.data;
  }

  const encryptCard = async () => {
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

    console.log(encryptedCard);
    return encryptedCard;
  };

  const finalizarCompra = async () => {
    try {
      const novoPedido = await gerarPedido();

      if (!novoPedido) {
        alert("Não foi possível criar o pedido.");
        return;
      }
      
      let cartaoEncriptado = null

      if (metodo === 'catao') {
        cartaoEncriptado = await encryptCard();
      }

      const pagamento = await gerarPagamento(novoPedido, cartaoEncriptado);

      if (metodo === "boleto") {
        setPdfBoleto(pagamento.charges[0].links.find(l => l.media === "application/pdf").href);
      } else if (metodo === "pix") {
        const qr = pagamento.qr_codes?.[0];
        if (qr) {
          console.log("Chave PIX:", qr.text);
          setQrCode(qr.links.find(l => l.rel === "QRCODE.PNG").href);
          setChavePix(qr.text);
        }
      } else if (metodo === "cartao") {
        alert("Pagamento com cartão processado!");
        console.log("Pagamento com cartão processado!");
      }
    } catch (err) {
      console.error("Erro ao finalizar compra:", err);
      alert("Erro ao finalizar compra");
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
                    <strong>{end.rua}, {end.numero} - {end.bairro}</strong>
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
                <button className="btn-prev" onClick={(e) => {e.preventDefault(); handlePrev();}}>Voltar</button>
                <button className="btn-next" onClick={(e) => {e.preventDefault(); handleNext();}} disabled={!freteSelecionado}>Continuar</button>
              </div>
            </div>
          )}

          {/* Etapa 4 - Pagamento */}
          {step === 3 && (
            <div className="checkout-step">
              <div className="pagamento-opcoes">
                <div className="abas-pagamento">
                  <button className={`aba ${metodo === "cartao" ? "ativa" : ""}`} onClick={() => setMetodo("cartao")}>
                    Cartão
                  </button>
                  <button className={`aba ${metodo === "boleto" ? "ativa" : ""}`} onClick={() => setMetodo("boleto")}>
                    Boleto
                  </button>
                  <button className={`aba ${metodo === "pix" ? "ativa" : ""}`} onClick={() => setMetodo("pix")}>
                    PIX
                  </button>
                </div>

                <div className="conteudo-pagamento">
                  {metodo === "cartao" && (
                    <div className="cartao-container">
                      <div className="entradas-box">
                        <div className="tipo-cartao">
                          <label>
                            <input type="radio" value="credito" checked={tipoCard === "credito"} onChange={() => setTipoCard("credito")} style={{ marginRight: '5px' }}/>
                            Crédito
                          </label>
                          <label>
                            <input type="radio" value="debito" checked={tipoCard === "debito"} onChange={() => setTipoCard("debito")} style={{ marginRight: '5px' }}/>
                            Débito
                          </label>
                        </div>

                        <input className="input-pagamento" type="text" placeholder="Número do Cartão"
                          value={numeroCard}
                          onChange={(e) => setNumeroCard(e.target.value)}
                        />
                        <input className="input-pagamento" type="text" placeholder="Nome no Cartão"
                          value={nomeCard}
                          onChange={(e) => setNomeCard(e.target.value.toUpperCase())}
                        />
                        <input className="input-pagamento" type="text" placeholder="Validade (MM/AA)"
                          value={validadeCard}
                          onChange={(e) => setValidadeCard(e.target.value)}
                        />
                        <input className="input-pagamento" type="text" placeholder="CVV"
                          value={cvvCard}
                          onChange={(e) => setCvvCard(e.target.value)}
                        />
                      </div>

                      <div className="cartao-mockup">
                        <div className="chip"></div>
                        <div className="numero-cartao">{numeroCard || "•••• •••• •••• ••••"}</div>
                        <div className="nome-validade">
                          <span>{nomeCard || "NOME NO CARTÃO"}</span>
                          <span className="validade">{validadeCard || "MM/AA"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {metodo === "boleto" && (
                    <div>
                      <h4>Gerar Boleto</h4>
                        <p>O boleto será gerado com seus dados cadastrados.</p>

                      <div>
                        {pdfBoleto && (
                          <>
                            <iframe 
                              src={pdfBoleto} 
                              width="100%" 
                              height="300px"
                              style={{ border: 'none' }}
                              title="Boleto"
                            >
                            </iframe>
                            <a href={pdfBoleto} target="_blank" rel="noopener noreferrer">
                              <button>Baixar Boleto</button>
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {metodo === "pix" && (
                    <div>
                      <h4>Pagar via PIX</h4>
                      <p>Escaneie o QR Code ou copie a chave PIX para pagar.</p>

                      {qrCode && (
                        <>
                          <img src={`${qrCode}`} alt="QR Code PIX" style={{ maxHeight: '200px' }}/>
                          <button onClick={() => navigator.clipboard.writeText(chavePix)}>
                            Copiar Chave PIX
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="checkout-buttons">
                <button className="btn-prev" onClick={(e) => {e.preventDefault(); handlePrev();}}>Voltar</button>
                
                <button className="btn-finalizar" onClick={() => finalizarCompra()}>Finalizar Compra</button>
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
