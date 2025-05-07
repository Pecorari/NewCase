import React from 'react';

import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';

import './trocas.css';

const TrocasEDevolucoes = () => {
  return (
    <div className="trocas">
      <Header />
      <main className="trocas-container">
        <h1>Trocas e Devoluções</h1>

        <p>Na MyCell Store, queremos que você tenha a melhor experiência possível. Por isso, oferecemos uma política de trocas e devoluções transparente e conforme o Código de Defesa do Consumidor.</p>

        <h2>1. Prazo para Troca ou Devolução</h2>
        <p>Você tem até <strong>7 dias corridos</strong> após o recebimento do pedido para solicitar a troca ou devolução do produto, conforme o direito de arrependimento (Art. 49 do CDC).</p>

        <h2>2. Condições para Troca ou Devolução</h2>
        <p>Para que a troca ou devolução seja aceita, o produto deve estar:</p>
        <ul>
          <li>Sem sinais de uso;</li>
          <li>Com embalagem original (caso haja);</li>
          <li>Com todos os acessórios e brindes enviados.</li>
        </ul>

        <h2>3. Produtos com Defeito</h2>
        <p>Se o produto apresentar defeito de fabricação, o cliente poderá solicitar a troca em até <strong>30 dias</strong> corridos após o recebimento. Será feita uma análise técnica e, se confirmada, a troca será feita sem custos.</p>

        <h2>4. Como Solicitar</h2>
        <p>Para iniciar o processo de troca ou devolução, entre em contato pelo WhatsApp ou Instagram da loja, informando o número do pedido e o motivo da solicitação.</p>

        <h2>5. Custos de Envio</h2>
        <p>Se a devolução ou troca for por defeito ou erro da loja, os custos de envio são por nossa conta. Em casos de arrependimento ou troca por outro modelo/cor, o custo do frete é do cliente.</p>

        <h2>6. Restituição do Valor</h2>
        <p>Após o recebimento e análise do produto devolvido, o valor será restituído conforme a forma de pagamento utilizada:</p>
        <ul>
          <li>Cartão de crédito: estorno em até 2 faturas;</li>
          <li>Pix ou boleto: reembolso via transferência bancária em até 5 dias úteis.</li>
        </ul>

        <h2>7. Produtos em Promoção</h2>
        <p>Produtos adquiridos em promoção só poderão ser trocados por itens da mesma categoria e valor promocional.</p>

        <h2>8. Contato</h2>
        <p>Qualquer dúvida, fale com a gente pelo WhatsApp ou Instagram. Estamos aqui para te ajudar!</p>
      </main>
      <Footer />
    </div>
  );
};

export default TrocasEDevolucoes;