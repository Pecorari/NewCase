import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from "qrcode.react";
import api from '../../hooks/useApi';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './pedidoDetails.css';

function PedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemPag, setmensagemPag] = useState(null);

  useEffect(() => {
    getPedido();
    // eslint-disable-next-line 
  }, [id]);

  const getPedido = async () => {
    try {
      const response = await api.get(`/pedidos/${id}`);

      setPedido(response.data.pedido[0]);
      setItens(response.data.itens);
      setPagamento(response.data.pagamento[0]);
      setLoading(false);
      console.log(response.data.pagamento[0]);
    } catch (error) {
      setErro('Não foi possível carregar o pedido.');
      setLoading(false);
    }
  };
 
  const formatarDataHora = (isoString) => {
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  };

  if (loading) return <div className="loading">Carregando detalhes do pedido...</div>;
  if (erro) return <div className="erro">{erro}</div>;

  return (
    <div className='myPedido'>
      <Header />
        <div className="pedido-detalhes">
          <button className="btn-voltar" onClick={() => navigate(-1)}>&larr; Voltar</button>
          <h1>Detalhes do Pedido #{pedido.id}</h1>

          <div className='column-container'>
            <div className='right-column'>
              <section className="secao-info">
                <h2>Informações Gerais</h2>
                <p>Status: {pedido.status}</p>
                <p>Data do Pedido: {formatarDataHora(pedido.criado_em)}</p>
                <p>Subtotal: R$ {pedido.total - pedido.frete_valor}</p>
                <p>Frete: R$ {pedido.frete_valor}</p>
                <p>Total: R$ {pedido.total}</p>
              </section>

              <section className="secao-endereco">
                <h2>Endereço a ser entregue</h2>
                <p>Rua: {pedido.endereco_rua}</p>
                <p>Número: {pedido.endereco_numero}</p>
                <p>Bairro: {pedido.endereco_bairro}</p>
                <p>Cidade: {pedido.endereco_cidade}</p>
                <p>Estado: {pedido.endereco_estado}</p>
                <p>Complemento: {pedido.endereco_complemento}</p>
                <p>CEP: {pedido.endereco_cep}</p>
              </section>

              <section className="secao-itens">
                <h2>Itens do Pedido</h2>
                <ul>
                  {itens.map((item) => (
                    <li key={item.id} className="item-pd" onClick={() => navigate(`/produto/${item.produto_id}`)}>
                      <img src={item.imagens[0]} alt='Imagem do produto' className='img-item'/>
                      <div className="item-pd-info">
                        <div className='boxes-info-pd'>
                          <h3>{item.produto_nome} <span className='span-id'>ID: #{item.produto_id}</span></h3>
                          <p className='compatibilidade'>{item.aparelho_nome}</p>
                        </div>
                        <div className='boxes-valor-pd'>
                          <p>Qtd: {item.quantidade}</p>
                          <p>R$ {item.preco_unitario}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className='left-column'>
              {pagamento && (
                <section className="secao-pagamento">
                  <h2>Pagamento</h2>
                  <div className='pagamento-container'>
                    <div className='infPagamento'>
                      <p>Forma de Pagamento: {pagamento?.metodo_pagamento}</p>
                      <p>Status do Pagamento: {pagamento?.status_pagamento || 'Aguardando confirmação do pagamento'}</p>
                      {pagamento?.pago_em === null && (
                        <p>Valor a ser pago: {Number(pagamento.valor_total).toFixed(2)}</p>
                      )}
                      {pagamento?.pago_em !== null && (
                        <>
                          <p>Valor pago: {Number(pagamento.valor_total).toFixed(2)}</p>
                          <p>Pago em {formatarDataHora(pagamento?.pago_em)}</p>
                        </>
                      )}
                    </div>
          
                    {pagamento?.chave_pix && (
                      <div className='boleto-pix'>
                        <QRCodeSVG value={pagamento?.chave_pix} marginSize={1} className='qrCode' />
                        <div className='btn-msg'>
                          {mensagemPag && <span>{mensagemPag}</span>}
                          <button className='pagamentoBtn' onClick={() => {
                            navigator.clipboard.writeText(pagamento?.chave_pix);
                            setmensagemPag('Chave Pix copiada!');
                          }}>
                            Copiar Chave PIX
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {pagamento?.link_boleto && (
                    <div className='boleto-pix'>
                      <iframe 
                        src={pagamento?.link_boleto}
                        title="Boleto"
                        className='boleto'
                      >
                      </iframe>
                      <div className='btn-msg'>
                        {mensagemPag && <span>{mensagemPag}</span>}
                        <a href={pagamento?.link_boleto} target="_blank" rel="noopener noreferrer">
                          <button className='pagamentoBtn'>Baixar Boleto</button>
                        </a>
                      </div>
                    </div>
                  )}
                </section>
              )}
              {pedido && (
                <section className="secao-frete">
                  <h2>Frete</h2>
                  <img src={pedido.frete_logo} alt='logo-frete'/>
                  <p>Serviço: {pedido.frete_nome}</p>
                  <p>Entrega: {pedido.frete_prazo} dias úteis</p>
                  <p>Valor: {pedido.frete_valor}</p>
                </section>
              )}
            </div>
          </div>

          <footer className="rodape">
            <p>Se você tiver dúvidas sobre este pedido, entre em contato com nosso suporte.</p>
          </footer>
        </div>
      <Footer />
    </div>
  );
}

export default PedidoDetail;
