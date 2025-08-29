const axios = require("axios");

const createSession = async (req, res) => {
  try {
    const response = await axios.post(`${process.env.PAGBANK_API}/v2/sessions?email=${process.env.PAGBANK_EMAIL}&token=${process.env.PAGBANK_TOKEN}`);

    res.json(response.data);
  } catch (err) {
    console.error("Erro criar sessão:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao criar sessão" });
  }
};

const pagamento = async (req, res) => {
  try {
    const pagamento = req.body; // deve conter o cardToken + dados do pedido
    const response = await axios.post(`${process.env.PAGBANK_API}/transactions?email=${process.env.PAGBANK_EMAIL}&token=${process.env.PAGBANK_TOKEN}`,
      pagamento,
      { headers: { "Content-Type": "application/json" } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Erro no pagamento:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao processar pagamento" });
  }
};

const notificacao = async (req, res) => {
  console.log("Notificação recebida:", req.body);

  const response = await axios.get(`${process.env.PAGBANK_API}/v3/transactions/notifications/${req.body.notificationCode}?email=${process.env.PAGBANK_EMAIL}&token=${process.env.PAGBANK_TOKEN}`);

  const transacao = response.data;

  console.log("Transação:", transacao);

  // Atualizar do MySQL

  res.sendStatus(200);
};

module.exports = {
  createSession,
  pagamento,
  notificacao
};
