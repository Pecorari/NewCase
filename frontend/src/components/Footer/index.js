import { Link } from "react-router-dom";
import visa from "../../assets/utils/pagamentos/visa.png"
import mastercard from "../../assets/utils/pagamentos/mastercard.png"
import pix from "../../assets/utils/pagamentos/pix.png"
import boleto from "../../assets/utils/pagamentos/boleto.png"
import facebook from "../../assets/utils/redes/facebook.png"
import instagram from "../../assets/utils/redes/instagram.png"
import whatsapp from "../../assets/utils/redes/whatsapp.png"

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
            <img src={visa} alt="Visa" />
            <img src={mastercard} alt="Mastercard" />
            <img src={pix} alt="Pix" />
            <img src={boleto} alt="Boleto" />
          </div>
        </div>

        <div className="footer-section">
          <h3>Contato</h3>
          <p className="contato-email">Email: contato@mycell.com</p>
          <p>WhatsApp: (19) 97401-2628</p>
          <div className="socials">
            <a href="/"><img src={facebook} alt="Facebook" /></a>
            <a href="/"><img src={instagram} alt="Instagram" /></a>
            <a href="/"><img src={whatsapp} alt="Whatsapp" /></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 MyCell Store. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export default Footer;
