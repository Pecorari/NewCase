import { useEffect } from "react";

export function useRecaptcha() {
  useEffect(() => {
    // Evitar carregar duas vezes
    if (!document.getElementById("recaptcha-script")) {
      const script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src = `https://www.google.com/recaptcha/api.js?render=6Leod_IrAAAAALtjVWtPDPv19R4dsxbzpNLDCTdE`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    return () => {
      // Remove o script ao sair da página
      const script = document.getElementById("recaptcha-script");
      if (script) script.remove();

      // Remove o badge (aquele selo flutuante)
      const badge = document.querySelector(".grecaptcha-badge");
      if (badge) badge.remove();

      // Remove instância para evitar bugs no iPhone/Safari
      delete window.grecaptcha;
    };
  }, []);
}
