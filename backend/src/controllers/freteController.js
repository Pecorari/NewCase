const axios = require('axios');
require('dotenv').config();

const calcularFrete = async (req, res) => {
  const {
    cepOrigem,
    cepDestino,
    peso,
    largura,
    altura,
    comprimento,
    valorDeclarado
  } = req.body;

  try {
    const response = await axios.post(
      'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
      [
        {
          from: { postal_code: cepOrigem },
          to: { postal_code: cepDestino },
          package: {
            weight: peso,
            width: largura,
            height: altura,
            length: comprimento
          },
          options: {
            insurance_value: valorDeclarado,
            receipt: false,
            own_hand: false,
            reverse: false,
            non_commercial: true
          },
          products: [
            {
              name: 'Produto',
              quantity: 1,
              unitary_value: valorDeclarado
            }
          ]
        }
      ],
      {
        headers: {
          'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error('Erro ao calcular frete:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Erro ao calcular frete' });
  }
};

module.exports = { calcularFrete };
