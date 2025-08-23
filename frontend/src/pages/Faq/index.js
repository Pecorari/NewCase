import RedesSociais from "../../components/RedesSociais";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './faq.css';

const Faq = () => {
  return (
    <div className="faqPage">
      <Header />
      <div className='faq'>
        <section className="faq-section">
          <h1>Perguntas Frequentes</h1>

          <div className="faq-category">
            <h2>Sobre segurança e pagamento</h2>

            <details>
              <summary>Quais formas de pagamento vocês aceitam?</summary>
              <p>Aceitamos Pix, cartão de crédito (com parcelamento), boleto bancário e carteiras digitais</p>
            </details>

            <details>
              <summary>É seguro comprar no site de vocês?</summary>
              <p>Sim! Nosso site possui certificado SSL e todas as transações são criptografadas.</p>
            </details>

            <details>
              <summary>Meus dados ficam salvos?</summary>
              <p>Armazenamos apenas informações essenciais para envio e contato. Seus dados bancários estão seguros.</p>
            </details>
          </div>

          <div className="faq-category">
            <h2>Sobre envio e entrega</h2>

            <details>
              <summary>Quanto tempo leva para meu pedido ser enviado?</summary>
              <p>Todos os pedidos são processados e enviados em até 24h úteis após a confirmação do pagamento.</p>
            </details>

            <details>
              <summary>Qual o prazo de entrega?</summary>
              <p>O prazo de entrega varia de acordo com sua localização, mas geralmente leva de 2 a 7 dias úteis.</p>
            </details>

            <details>
              <summary>Como posso rastrear meu pedido?</summary>
              <p>Você receberá um código de rastreio por e-mail assim que o pedido for enviado.</p>
            </details>
          </div>

          <div className="faq-category">
            <h2>Sobre produtos e pedidos</h2>

            <details>
              <summary>As cores dos produtos são fiéis às fotos?</summary>
              <p>Sim, mas podem variar ligeiramente dependendo da tela do dispositivo.</p>
            </details>

            <details>
              <summary>E se o produto vier com defeito?</summary>
              <p>Você pode solicitar a troca dentro de 7 dias após o recebimento.</p>
            </details>
          </div>

          <div className="faq-category">
            <h2>Atendimento e redes</h2>

            <details>
              <summary>Como entro em contato com vocês?</summary>
              <p>Você pode nos chamar no WhatsApp, Instagram ou e-mail.</p>
            </details>

            <details>
              <summary>Vocês têm loja física?</summary>
              <p>No momento, nosso atendimento é 100% online.</p>
            </details>
          </div>
        </section>
        
        <RedesSociais />
      </div>
      <Footer />
    </div>
  );
};

export default Faq;
