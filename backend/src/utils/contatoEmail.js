const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarContatoEmail = async (nome, email, mensagem) => {
  const mailOptions = {
    from: `"Contato Site" <${email}>`,
    to: `"MyCell Store" <${process.env.EMAIL_USER}>`,
    subject: `Mensagem de Contato de ${nome}`,
    text: `
      Nome: ${nome}
      E-mail: ${email}
      Mensagem: ${mensagem}
    `
  };

  return transporter.sendMail(mailOptions);
};


module.exports = { enviarContatoEmail };
