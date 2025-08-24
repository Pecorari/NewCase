import React, { useEffect, useState } from 'react';
import { BsTrash3 } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IMaskInput } from "react-imask";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import { calcularFrete } from '../../services/freteService';
import api from '../../hooks/useApi';

import "./carrinho.css";

const Carrinho = () => {
  const { atualizarQtdCarrinho  } = useCarrinho();
  const [produtos, setProdutos] = useState([]);
  const [indiceImagem, setIndiceImagem] = useState({});
  const [valorTotal, setValorTotal] = useState(0);
  const [modalEntregaAberto, setModalEntregaAberto] = useState(false);
  const [endereco, setEndereco] = useState({
    nome: "",
    cpf: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    complemento: ""
  });
  const [fretes, setFretes] = useState([]); // eslint-disable-next-line
  const [freteSelecionado, setFreteSelecionado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getProdutos();
  }, []);

  useEffect(() => {
    if (endereco.cep.replace(/\D/g, '').length === 8) {
      buscarFretes(endereco.cep);
    } // eslint-disable-next-line 
  }, [produtos, endereco.cep]);

  const getProdutos = async () => {
    try {
      const response = await api.get('/carrinho');
      setProdutos(response.data);

      const total = response.data.reduce((acc, produto) => {
        return acc + Number(produto.preco) * Number(produto.quantidade);
      }, 0);

      setValorTotal(total);
    } catch (error) {
      console.log('Não foi possivel listar produtos do carrinho:', error);
    }
  }

  const removeCart = async (id) => {
    try {
      await api.delete(`/carrinho/del/${id}`);
      console.log('removido!');
      atualizarQtdCarrinho();
      getProdutos();
    } catch (error) {
      console.log('Não foi possivel remover o produto:', error);
    }
  };

  const fechaModal = () => {
    setEndereco({
      nome: "",
      cpf: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      complemento: ""
    });
    setFreteSelecionado(null);
    setModalEntregaAberto(false);
  }

  const buscarCep = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado!");
        return;
      }

      setEndereco((prev) => ({
        ...prev,
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        cep: data.cep
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

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

  const gerarPedido = async () => {
    if (!freteSelecionado) {
      alert("Selecione um frete para continuar");
      return;
    }

    if (!endereco.nome || !endereco.cpf || !endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado || !endereco.cep) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const totalComFrete = valorTotal + Number(freteSelecionado?.price?.toString().replace(',', '.')) || 0;
    const cepFormatado = Number(endereco.cep.replace(/\D/g, ""));

    try {
      const dataPedido = {
        total: totalComFrete,
        endereco_rua: endereco.rua,
        endereco_numero: Number(endereco.numero),
        endereco_bairro: endereco.bairro,
        endereco_cidade: endereco.cidade,
        endereco_estado: endereco.estado,
        endereco_cep: cepFormatado,
        endereco_complemento: endereco.complemento,
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

      if (response.data?.pedido) {
        console.log("Pedido criado:", response.data);

        await api.delete("/carrinho/limpar");
        setProdutos([]);
        atualizarQtdCarrinho();
        setValorTotal(0);

        fechaModal();
        // aqui você pode redirecionar para página de pagamento
      } else {
        alert("Erro ao criar pedido");
      }
    } catch (err) {
      console.error("Erro ao gerar pedido:", err);
      alert("Erro ao gerar pedido, tente novamente");
    }
  };
    
  const proximaImagem = (id, total) => {
    setIndiceImagem(prev => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % total
    }));
  };
  
  const imagemAnterior = (id, total) => {
    setIndiceImagem(prev => ({
      ...prev,
      [id]: ((prev[id] ?? 0) - 1 + total) % total
    }));
  };
  
  return (
    <div className="carrinho">
      <Header />
      <div className="carrinho-container">
        <button className="btn-voltar-carrinho" onClick={() => navigate(-1)}>&larr; Voltar</button>
        <h2 className='title-cart'>Seu Carrinho</h2>

        <ul className="carrinho-itens">
          {produtos.length !== 0 ? produtos.map((produto, index) => {
            const imagens = produto.imagens || [];
            const indice = indiceImagem[produto.carrinho_id] || 0;

            return (
              <li key={index} className="item" onClick={() => navigate(`/produto/${produto.produto_id}`)}>
                <div className="imagem-carrinho-container">
                  {imagens.length > 0 && (
                    <>
                      <img src={imagens[indice]} alt={produto.produto_nome} className="produto-img" />
                      {imagens.length > 1 && (
                        <>
                          <button className="seta seta-esquerda" onClick={(e) =>  {e.stopPropagation(); imagemAnterior(produto.carrinho_id, imagens.length)}}><IoIosArrowBack /></button>
                          <button className="seta seta-direita" onClick={(e) => {e.stopPropagation(); proximaImagem(produto.carrinho_id, imagens.length)}}><IoIosArrowForward /></button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className='info-item'>
                  <span className="title">{produto.produto_nome}</span>
                  <span className="compativel">{produto.aparelho_nome}</span>
                </div>
                <div className='info-preco-item'>
                  <span className="preco-carrinho">QTD: {produto.quantidade}</span>
                  <span className="preco-carrinho">{(produto.preco * produto.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>

                <button className="remover" onClick={(e) => {e.preventDefault(); e.stopPropagation(); removeCart(produto.carrinho_id)}}><BsTrash3 /></button>
              </li>
            );
          }) : <p className='msg-carrinho-vazio'>Seu carriho está vazio! <br/><br/> Você ainda não adicionou nenhum produto ao carrinho.</p>
          }
        </ul>

        <div className="total-container">
          <p className='total'>Total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <div className='btn-total'>
            <button className="continuar-comprando" onClick={() => navigate('/loja')}>&larr; Voltar as compras</button>
            <button className="finalizar" onClick={() => {if (produtos.length === 0) return; setModalEntregaAberto(true)}} disabled={produtos.length === 0}>Finalizar Compra</button>
          </div>
        </div>

        {modalEntregaAberto && (
          <div className="modal-entrega">
            <div className="modal-content-entrega">
              <h2>Informe o endereço de entrega</h2>
              
              <input type="text" placeholder="Nome" value={endereco.nome} onChange={e => setEndereco({...endereco, nome: e.target.value})} required />
              <IMaskInput mask={"000.000.000-00"} type="text" placeholder="CPF" value={endereco.cpf} onAccept={value => setEndereco({...endereco, cpf: value})} required />
              <IMaskInput mask={"00000-000"} type="text" placeholder="CEP" value={endereco.cep} required 
                onAccept={value => {
                  const novoCep = value;
                  setEndereco({...endereco, cep: novoCep});

                  if (novoCep.replace(/\D/g, '').length === 8) {
                    buscarCep(novoCep.replace(/\D/g, ''));
                    buscarFretes(novoCep);
                  }
                }}
              />
              <input type="text" placeholder="Rua" value={endereco.rua} onChange={e => setEndereco({...endereco, rua: e.target.value})} disabled style={{ backgroundColor: '#2b2b2bff', border: 'none' }} />
              <input type="number" placeholder="Número" value={endereco.numero} onChange={e => setEndereco({...endereco, numero: e.target.value})} required />
              <input type="text" placeholder="Bairro" value={endereco.bairro} onChange={e => setEndereco({...endereco, bairro: e.target.value})} disabled style={{ backgroundColor: '#2b2b2bff', border: 'none' }} />
              <input type="text" placeholder="Cidade" value={endereco.cidade} onChange={e => setEndereco({...endereco, cidade: e.target.value})} disabled style={{ backgroundColor: '#2b2b2bff', border: 'none' }} />
              <input type="text" placeholder="Estado" value={endereco.estado} onChange={e => setEndereco({...endereco, estado: e.target.value})} disabled style={{ backgroundColor: '#2b2b2bff', border: 'none' }} />
              <input type="text" placeholder="Complemento" value={endereco.complemento} onChange={e => setEndereco({...endereco, complemento: e.target.value})} />

              <h3>Escolha o frete</h3>
              <ul>
                {fretes.map((opcao, index) => (
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
                ))}
              </ul>
              

              <div className='btn-modal-pedido'>
                <button className='btn-modal-cancel'onClick={() => fechaModal()}>Cancelar</button>
                <button className='btn-modal-continuar' onClick={() => {
                  if (!freteSelecionado) return alert("Selecione um frete!");
                  gerarPedido();
                }}> Continuar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Carrinho;
