const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarEmailVerificacao = async (email, token) => {
  const link = `${process.env.BASE_URL}/confirmar-email?token=${token}`;

  const mailOptions = {
    from: `"NewCase Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirmação de E-mail',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; background-color: #fff; border-radius: 8px;">
        <div style="text-align: center;">
          <img src="https://firebasestorage.googleapis.com/v0/b/newcase-a6d58.firebasestorage.app/o/logo_com_nome.png?alt=media&token=6f0dfb24-7c17-4cc1-aa7c-d461519683fc" alt="NewCase Store" style="margin-bottom: 20px; width: 190px; height: 165px;" />
        </div>
        <h2 style="color: #333;">Confirme seu e-mail</h2>
        <p style="font-size: 15px; color: #555;">
          Olá! Obrigado por se registrar na <strong>NewCase Store</strong> 😊<br/>
          Para ativar sua conta e aproveitar todas as vantagens da nossa loja, clique no botão abaixo:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #e91e63; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Confirmar E-mail
          </a>
        </div>
        <p style="font-size: 14px; color: #777;">
          Ou copie e cole este link no seu navegador:
          <br/>
          <a href="${link}" style="color: #e91e63;">${link}</a>
        </p>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Você recebeu este e-mail porque se cadastrou na NewCase Store.<br/>
          Se não foi você, ignore esta mensagem com segurança.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { enviarEmailVerificacao };
