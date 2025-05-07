import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../hooks/useApi';

import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';

import './pedidoDetails.css';

function PedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

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
                <p>Total: R$ {pedido.total}</p>
              </section>

              <section className="secao-endereco">
                <h2>Endereço a ser entregue</h2>
                <p>Rua: Rua Curitiba</p>
                <p>Número: 1317</p>
                <p>Bairro: Cidade Nova</p>
                <p>Cidade: Santa Barbára D'Oeste</p>
                <p>Estado: SP</p>
                <p>Complemento: Sobrado</p>
              </section>

              <section className="secao-itens">
                <h2>Itens do Pedido</h2>
                <ul>
                  {itens.map((item) => (
                    <li key={item.id} className="item-pd" onClick={() => navigate(`/produto/${item.produto_id}`)}>
                      <img src={item.imagens[0]} alt='Imagem do produto' className='img-item'/>
                      <div className="item-pd-info">
                        <div className='boxes-info-pd'>
                          <h3>{item.produto_nome}</h3>
                          <p>{item.aparelho_nome}</p>
                        </div>
                        <div className='boxes-valor-pd'>
                          <p>Quantidade: {item.quantidade}</p>
                          <p>Valor Unitário: <br/> R$ {item.preco_unitario}</p>
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
                  <p>Forma de Pagamento: {pagamento.metodo_pagamento}</p>
                  <p>Status do Pagamento: {pagamento.status_pagamento}</p>
                  {pagamento.pago_em ? <p>Valor a ser pago: {pagamento.valor_pago}</p> : <></>}
                  <p>Pago em {formatarDataHora(pagamento.pago_em)}</p>
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
