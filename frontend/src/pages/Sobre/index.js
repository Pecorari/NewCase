import { motion } from 'framer-motion';
import { SlArrowDown  } from "react-icons/sl";
import homecell from '../../assets/utils/parceiros/logo.png';

import RedesSociais from "../../components/RedesSociais";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './sobre.css';

function Sobre() {
  return (
    <div className='sobre'>
      <Header />
      <div className='sobre-container'>
        <div className="sobre-content">
          <section className="sobre-hero">
            <h1>Sobre a MyCell Store</h1>
            <p>
              Cada produto é escolhido com cuidado para garantir não só proteção, mas também aquele visual que chama atenção e te destaca na multidão. <br/><br/>
              Valorizamos a experiência completa — desde o momento em que você navega na loja até o recebimento rápido do seu pedido, embalado com carinho e prontinho pra uso. <br/><br/>
              O hype é constante. Aqui você quem dita a tendência.
            </p>

            <motion.div className='motion' animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <a href='#diferenciais'><SlArrowDown className='nextSection'/></a>
            </motion.div>
          </section>

          <section id='diferenciais' className="diferenciais">
            <h2>Nossos Diferenciais</h2>
            <div className="diferenciais-container">
              <div className="diferencial">
                <div className="icon">🔥</div>
                <h3>Produtos em Alta</h3>
                <p>Trabalhamos com tendências para trazer as capas mais desejadas do momento.</p>
              </div>
              <div className="diferencial">
                <div className="icon">🎨</div>
                <h3>Design Exclusivo</h3>
                <p>Produtos autorais feitos com criatividade e personalidade.</p>
              </div>
              <div className="diferencial">
                <div className="icon">⚡</div>
                <h3>Envio Rápido</h3>
                <p>Pedidos enviados em até 24h úteis após a confirmação.</p>
              </div>
              <div className="diferencial">
                <div className="icon">💬</div>
                <h3>Atendimento Humanizado</h3>
                <p>Suporte de verdade, com pessoas reais e prontas pra ajudar.</p>
              </div>
              <div className="diferencial">
                <div className="icon">🔒</div>
                <h3>Compra Segura</h3>
                <p>Ambiente 100% seguro com criptografia e proteção de dados.</p>
              </div>
            </div>
          </section>

          <section className="parcerias">
            <h2>Parcerias</h2>
            <p>Trabalhamos em conjunto com marcas que compartilham os mesmos valores que a nossa loja.</p>
            <div className="logos">
              <a href='https://homecellofficial.com.br/' target='blank'><img src={homecell} alt="HomeCell" /></a>
            </div>
          </section>

          <section className="sobre-valores">
            <h2>O que nos move</h2>
            <div className="valores-cards">
              <div className="card">
                <h3>Missão</h3>
                <p>
                  Oferecer capas modernas que combinem proteção e estilo para todos os tipos de clientes.
                </p>
              </div>
              <div className="card">
                <h3>Visão</h3>
                <p>
                  Ser referência em capas para celular, reconhecida pela inovação e confiança.
                </p>
              </div>
              <div className="card">
                <h3>Valores</h3>
                <p>
                  Compromisso com o cliente, criatividade nos produtos e transparência em todas as etapas do atendimento.
                </p>
              </div>
            </div>
          </section>

          <section className="sobre-extra">
            <p>Feito com ❤️ por apaixonados por tecnologia e estilo.</p>
          </section>
        </div>
        <RedesSociais />
      </div>

      <Footer />
    </div>
  );
}

export default Sobre;
