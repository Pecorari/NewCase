const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarLinkRedefinicao = async (email, token) => {
  const link = `${process.env.BASE_URL}/redefinir-senha?token=${token}`;

  const mailOptions = {
    from: `"MyCell Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Redefinição de Senha',
    html: `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color:rgb(255, 255, 255); color:rgb(0, 0, 0);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 10px;">
          <img src="https://firebasestorage.googleapis.com/v0/b/mycellstore-da6f9.firebasestorage.app/o/produtos%2FMyCell%20Logo%20-%20760x760.png?alt=media&token=75927860-4c5d-4dda-9f76-b3c73b097314" alt="Logo da loja" style="width: 150px; height: 150px;">
        </div>

        <hr style="border: none; border-top: 1px solid rgb(100, 100, 100); margin: 20px 0;">

        <!-- Conteúdo -->
        <h2 style="color: #e91e63; text-align: center;">Redefinir Senha</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para continuar:
        </p>

        <!-- Botão -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="padding: 12px 24px; background-color: #e91e63; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px;">
            Redefinir Senha
          </a>
        </div>

        <p style="font-size: 14px; color:rgb(0, 0, 0);">
          Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
        </p>

        <p style="word-break: break-all; font-size: 14px; color:rgb(22, 22, 22);">
          ${link}
        </p>

        <hr style="border: none; border-top: 1px solid rgb(26, 26, 26); margin: 40px 0;">

        <!-- Rodapé -->
        <p style="font-size: 12px; color:rgb(100, 100, 100); text-align: center;">
          Você está recebendo este e-mail porque alguém solicitou uma redefinição de senha para sua conta na <strong>MyCell Store</strong>.
          <br>Se não foi você, pode ignorar este e-mail com segurança.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { enviarLinkRedefinicao };
