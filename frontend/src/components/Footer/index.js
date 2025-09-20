import { Link } from "react-router-dom";
import "./footer.css";

function Footer() {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Sobre Nós</h3>
          <p>Capinhas modernas, resistentes e compatíveis com diversos modelos. Estilo e proteção para seu smartphone.</p>
        </div>

        <div className="footer-section">
          <h3>Links Úteis</h3>
          <ul>
            <li><Link to="/perfil">Minha Conta</Link></li>
            <li><Link to="/trocas-e-devolucoes">Trocas e Devoluções</Link></li>
            <li><Link to="/politica-privacidade">Política de Privacidade</Link></li>
            <li><Link to="/">Rastrear Pedido</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Formas de Pagamento</h3>
          <div className="payment-methods">
            <img src='/bandeiras/visa.svg' alt="Visa" />
            <img src='/bandeiras/mastercard.svg' alt="Mastercard" />
            <img src='/bandeiras/elo.svg' alt="Elo" />
            <img src='/bandeiras/hipercard.svg' alt="Hipercard" />
            <br />
            {/* <img src='/bandeiras/hiper.svg' alt="Hiper" /> */}
            <img src='/bandeiras/american-express.svg' alt="American-Express" />
            <img src='/bandeiras/diners-club.svg' alt="Diners-Club" />
            <img src='/bandeiras/pix.svg' alt="Pix" />
            <img src='/bandeiras/boleto.svg' alt="Boleto" />
          </div>
        </div>

        <div className="footer-section">
          <h3>Contato</h3>
          <p className="contato-email">Email: contato@mycell.com</p>
          <p>WhatsApp: (19) 97401-2628</p>
          <div className="socials">
            <a href="/"><img src='/redes/facebook.svg' alt="Facebook" /></a>
            <a href="/"><img src='/redes/instagram.svg' alt="Instagram" /></a>
            <a href="/"><img src='/redes/whatsapp.svg' alt="Whatsapp" /></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 NewCase. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export default Footer;
