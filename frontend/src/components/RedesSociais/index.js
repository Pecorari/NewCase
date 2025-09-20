import { FaFacebookF, FaTiktok, FaInstagram, FaWhatsapp   } from "react-icons/fa";

import './redesSociais.css'

function RedesSociais() {
  return (
    <div className="social-icons">
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaFacebookF /></a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaTiktok /></a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaInstagram /></a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="link-redes"><FaWhatsapp /></a>
    </div>
  );
}

export default RedesSociais;
