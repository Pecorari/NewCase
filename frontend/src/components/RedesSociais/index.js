import { FaFacebookF, FaInstagram, FaWhatsapp   } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import './redesSociais.css'

function RedesSociais() {
  return (
    <div className="social-icons">
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaFacebookF /></a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaXTwitter /></a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaInstagram /></a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaWhatsapp /></a>
    </div>
  );
}

export default RedesSociais;
