const connection = require('../database/connection');
const pedidosModel = require('../models/pedidosModel');
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
        postal_code: '13454-056'
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
      services: "1, 2, 31, 33",
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: valor
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Erro no cálculo de frete:', err.response?.data || err.message);
    res.status(500).json({ erro: 'Falha ao calcular frete' });
  }
};





const gerarEtiqueta = async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = await getValidToken();

    // 1️⃣ Busca dados do pedido no banco
    const pedido = await pedidosModel.getAdminPedidoBySearch(id);
    if (!pedido) {
        return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // 2️⃣ Monta o corpo do shipment (dados do pedido + frete escolhido)
    const shipmentBody = {
        service: pedido.frete_id,
        from: {
            name: "NEWCASE STORE",
            phone: "19974012628",
            email: "contato@newcase.com",
            company_document: "00000000000191",
            address: "Rua Exemplo",
            complement: "",
            number: "123",
            district: "Centro",
            city: "São Paulo",
            state_abbr: "SP",
            postal_code: "01001000"
        },
        to: {
            name: pedido.cliente_nome,
            phone: pedido.cliente_telefone,
            email: pedido.cliente_email,
            document: pedido.cliente_cpf,
            address: pedido.endereco_rua,
            complement: pedido.endereco_complemento || "",
            number: pedido.endereco_numero,
            district: pedido.endereco_bairro,
            city: pedido.endereco_cidade,
            state_abbr: pedido.endereco_estado,
            postal_code: pedido.endereco_cep
        },
        packages: [
            {
                height: pedido.produto_altura,
                width: pedido.produto_largura,
                length: pedido.produto_comprimento,
                weight: pedido.produto_peso
            }
        ],
        options: {
            insurance_value: pedido.total,
            receipt: false,
            own_hand: false,
            reverse: false,
            non_commercial: false
        }
    };
    
    // 3️⃣ Cria o shipment
    const shipmentResponse = await axios.post(`https://melhorenvio.com.br/api/v2/shipment`, [shipmentBody], {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    console.log(shipmentResponse);

    const shipmentId = shipmentResponse.data[0]?.id;
    if (!shipmentId) {
      throw new Error("Não foi possível criar o shipment no Melhor Envio.");
    }
    console.log("Shipment criado:", shipmentId);
    
    // salva o shipment_id no pedido
    pedido.shipment_id = shipmentId;
    await pedidosModel.updateAdminPedido(id, { shipment_id: shipmentId });





    return res.status(200).json({ message: 'Etiqueta gerada com sucesso!' });
  } catch (error) {
    console.error("Erro ao gerar etiqueta:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Falha ao gerar etiqueta",
      details: error.response?.data || error.message
    });
  }
};

module.exports = {
  obterToken,
  calcularFrete,
  gerarEtiqueta
};
