// middleware/verifyRecaptchaV3.js
const axios = require('axios');

const verifyRecaptchaV3 = (threshold = 0.5) => {
  return async (req, res, next) => {
    try {
        const { tokenRecaptcha } = req.body;
        if (!tokenRecaptcha) return res.status(400).json({ error: "Token reCAPTCHA ausente." });

        const { data: recaptchaData } = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: tokenRecaptcha,
            },
            timeout: 5000,
            }
        );

        const { success, score } = recaptchaData;

        if (!success || score < threshold) {
            console.warn("reCAPTCHA falhou:", recaptchaData);
            return res.status(403).json({
                error: "Falha na verificação de segurança. Tente novamente.",
                score,
            });
        } else {
            console.log('Score do reCAPTCHA:', score)
        }

        next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao verificar reCAPTCHA." });
    }
  };
};

module.exports = verifyRecaptchaV3;
