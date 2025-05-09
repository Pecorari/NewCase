const connection = require('../database/connection');
const axios = require('axios');
require('dotenv').config();

async function obterToken(req, res) {
  if (!req.query.code) return res.status(400).json({ erro: 'Código de autorização não fornecido' });

  try {
    const response = await axios.post('https://melhorenvio.com.br/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.ME_CLIENT_ID,
      client_secret: process.env.ME_CLIENT_SECRET,
      redirect_uri: process.env.ME_REDIRECT_URI,
      code: req.query.code
    });

    const tokenData = response.data;
    
    console.log('TokenData:', tokenData);
    console.log('Access Token:', tokenData.access_token.length);

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + tokenData.expires_in;
    
    await connection.execute('DELETE FROM token_me');
    const [result] = await connection.execute('INSERT INTO token_me(access_token, refresh_token, expires_at) VALUES (?, ?, ?)',
        [tokenData.access_token, tokenData.refresh_token, expiresAt]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Falha ao obter token' });
  }
}

async function getValidToken() {
  const [rows] = await connection.execute('SELECT * FROM token_me LIMIT 1');
  const token = rows[0];

  const now = Math.floor(Date.now() / 1000);

  if (token.expires_at <= now) {
    try {
      const refreshResponse = await axios.post('https://melhorenvio.com.br/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        client_id: process.env.ME_CLIENT_ID,
        client_secret: process.env.ME_CLIENT_SECRET
      });

      const newToken = refreshResponse.data;

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + newToken.expires_in;
      
      await connection.execute('UPDATE token_me SET access_token = ?, refresh_token = ?, expires_at = ?',
        [newToken.access_token, newToken.refresh_token, expiresAt]
      );

      return newToken.access_token;
    } catch (error) {
      console.error('Erro ao atualizar token:', error.response?.data || error.message);
      throw new Error('Falha ao atualizar token');
    }
  }

  return token.access_token;
}

const calcularFrete = async (req, res) => {
  const {cep_destino, peso, comprimento, altura, largura, valor} = req.body;

  if (!cep_destino || !peso || !comprimento || !altura || !largura || !valor) return res.status(400).json({ erro: 'Dados incompletos para o cálculo de frete' });

  try {
    const accessToken = await getValidToken();

    const response = await axios.post('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      from: {
        postal_code: '01001-000'
      },
      to: {
        postal_code: cep_destino
      },
      products: [
        {
          name: "Produto",
          quantity: 1,
          unitary_value: valor,
          weight: peso,
          length: comprimento,
          height: altura,
          width: largura
        }
      ],
      services: [], // se quiser especificar Correios, Jadlog, etc
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: valor
      }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MyCellStore (mycell.store.official@gmail.com)'
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Erro no cálculo de frete:', err.response?.data || err.message);
    res.status(500).json({ erro: 'Falha ao calcular frete' });
  }
};

module.exports = { obterToken, calcularFrete };
