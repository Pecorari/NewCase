import React from 'react';

import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';

import './politicaPrivacidade.css';

function PoliticaPrivacidade() {
  return (
    <div className="politica-page">
      <Header />
      <main className="politica-container">
        <h1>Política de Privacidade</h1>

        <p>Na <strong>MyCell Store</strong>, respeitamos a sua privacidade e estamos comprometidos em proteger os dados pessoais que você compartilha conosco.</p>

        <h2>1. Coleta de Informações</h2>
        <p>Coletamos informações pessoais como nome, e-mail, telefone e endereço quando você realiza um pedido ou se cadastra em nosso site.</p>

        <h2>2. Uso das Informações</h2>
        <p>As informações são utilizadas para processar pedidos, oferecer suporte, enviar promoções (com consentimento), e melhorar a sua experiência na loja.</p>

        <h2>3. Compartilhamento de Dados</h2>
        <p>Não vendemos, trocamos ou transferimos seus dados para terceiros, exceto para parceiros confiáveis que auxiliam no funcionamento do site e na entrega dos produtos.</p>

        <h2>4. Proteção dos Dados</h2>
        <p>Utilizamos medidas de segurança para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>

        <h2>5. Cookies</h2>
        <p>Utilizamos cookies para melhorar a navegação no site e personalizar conteúdo. Você pode optar por desativá-los no seu navegador.</p>

        <h2>6. Seus Direitos</h2>
        <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento. Basta entrar em contato conosco.</p>

        <h2>7. Alterações nesta Política</h2>
        <p>Podemos atualizar esta política periodicamente. As mudanças serão publicadas nesta página.</p>

        <h2>8. Contato</h2>
        <p>Em caso de dúvidas sobre nossa Política de Privacidade, entre em contato pelo e-mail: <a href="mailto:contato@mycellstore.com">contato@mycellstore.com</a>.</p>
      </main>
      <Footer />
    </div>
  );
}

export default PoliticaPrivacidade;
