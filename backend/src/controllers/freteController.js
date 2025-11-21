const connection = require('../database/connection');
const pedidosModel = require('../models/pedidosModel');
const { uploadEtiquetaPDF } = require("../utils/firebaseAdmin");
const axios = require('axios');
const crypto = require('crypto');
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

  if (!token) throw new Error('Token Melhor Envio não encontrado no DB');

  if (token.expires_at <= now) {
    try {
      const refreshResponse = await axios.post('https://melhorenvio.com.br/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        client_id: process.env.ME_CLIENT_ID,
        client_secret: process.env.ME_CLIENT_SECRET
      });

      const newToken = refreshResponse.data;
      const now2 = Math.floor(Date.now() / 1000);
      const expiresAt = now2 + newToken.expires_in;

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
  const { cep_destino, peso, comprimento, altura, largura, valor } = req.body;

  if (!cep_destino || !peso || !comprimento || !altura || !largura || !valor) return res.status(400).json({ erro: 'Dados incompletos para o cálculo de frete' });

  try {
    const accessToken = await getValidToken();

    const response = await axios.post(
      'https://melhorenvio.com.br/api/v2/me/shipment/calculate',
      {
        from: { postal_code: '13454-056' },
        to: { postal_code: cep_destino },
        products: [
          {
            name: 'Produto',
            quantity: 1,
            unitary_value: valor,
            weight: peso,
            length: comprimento,
            height: altura,
            width: largura
          }
        ],
        services: '1, 2, 31, 33',
        options: { own_hand: false, receipt: false, insurance_value: valor }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

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

    const pedidos = await pedidosModel.getAdminPedidoBySearch(id);
    const pedido = pedidos[0];
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    let etiquetaId = pedido.etiqueta_id;

    if (!etiquetaId) {
      console.log('Pedido sem etiqueta. Gerando e comprando agora...');

      const subtotal = Number(pedido.total) - Number(pedido.frete.valor);
      const totalPeso = pedido.itens.reduce((acc, item) => acc + Number(item.produto_peso) * item.quantidade, 0);
      const totalAltura = pedido.itens.reduce((acc, item) => acc + Number(item.produto_altura) * item.quantidade, 0);

      const payloadAddEtiquetasCart = {
        service: pedido.frete.frete_id,
        from: {
          name: 'NewCase',
          postal_code: '13454056',
          address: 'Rua da Batata',
          number: '123',
          district: 'Centro',
          city: 'São Paulo',
          state_abbr: 'SP'
        },
        to: {
          name: pedido.destinatario.nome,
          phone: pedido.destinatario.telefone,
          email: pedido.destinatario.email,
          document: pedido.destinatario.cpf,
          address: pedido.endereco.endereco_rua,
          number: pedido.endereco.endereco_numero,
          district: pedido.endereco.endereco_bairro,
          city: pedido.endereco.endereco_cidade,
          state_abbr: pedido.endereco.endereco_estado,
          postal_code: pedido.endereco.endereco_cep.replace(/\D/g, ''),
          complement: pedido.endereco.endereco_complemento
        },
        products: pedido.itens.map(item => ({
          name: item.nome,
          quantity: Number(item.quantidade),
          unitary_value: Number(item.preco_unitario)
        })),
        volumes: [
          {
            height: totalAltura,
            width: 12,
            length: 25,
            weight: totalPeso
          }
        ],
        options: {
          insurance_value: subtotal,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false
        }
      };

      const cartResponse = await axios.post('https://www.melhorenvio.com.br/api/v2/me/cart', payloadAddEtiquetasCart, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'NewCase contato@newcase.com'
        }
      });

      console.log('Adicionado ao carrinho!', cartResponse.data);

      const comprasEtiquetasCart = await axios.post('https://www.melhorenvio.com.br/api/v2/me/shipment/checkout', { orders: [cartResponse.data.id] }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'NewCase contato@newcase.com'
        }}
      );

      console.log('Resposta do checkout:', comprasEtiquetasCart.data);

      const etiquetaCompra = Array.isArray(comprasEtiquetasCart.data) ? comprasEtiquetasCart.data[0] : comprasEtiquetasCart.data;

      const generateResponse = await axios.post('https://www.melhorenvio.com.br/api/v2/me/shipment/generate', { orders: [etiquetaCompra.id] }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'NewCase contato@newcase.com'
        }}
      );

      console.log('Pedido de geração de PDF enviado:', generateResponse.data);

      await pedidosModel.updateAdminPedido(id, {
        etiqueta_id: etiquetaCompra.id,
        frete_protocolo: etiquetaCompra.protocol,
        frete_rastreio: etiquetaCompra.tracking,
        frete_status: etiquetaCompra.status
      });
      console.log('Dados de rastreio e id salvos no pedido!');

      const etiquetaUrl = await ObterEtiquetaPDF(id, accessToken, etiquetaCompra.id);

      return res.status(200).json({
        message: 'Etiqueta comprada e gerada PDF com sucesso!',
        etiqueta_url: etiquetaUrl
      });
    } else {
      console.log('Etiqueta já existente! Gerando e obtendo arquivo para upload no storage');

      const etiquetaUrl = await ObterEtiquetaPDF(id, accessToken, etiquetaId);

      return res.status(200).json({
        message: 'Etiqueta gerada PDF com sucesso!',
        etiqueta_url: etiquetaUrl
      });
    }
  } catch (error) {
    console.error('Erro ao gerar etiqueta:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Falha ao gerar etiqueta',
      details: error.response?.data || error.message
    });
  }
};

async function ObterEtiquetaPDF(id, accessToken, etiquetaId) {
  try {
    const maxRetries = 3;
    const delay = 5000;
    let pdfUrl = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const etiquetaUrlDownload = await axios.get(`https://www.melhorenvio.com.br/api/v2/me/imprimir/pdf/${etiquetaId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'NewCase contato@newcase.com'
          }
        });

        if (Array.isArray(etiquetaUrlDownload.data)) {
          pdfUrl = etiquetaUrlDownload.data[0];
        } else if (etiquetaUrlDownload.data && etiquetaUrlDownload.data.url) {
          pdfUrl = etiquetaUrlDownload.data.url;
        } else {
          pdfUrl = etiquetaUrlDownload.data;
        }

        if (!pdfUrl) throw new Error('URL do PDF não encontrada na resposta');

        console.log('Link PDF obtido:', pdfUrl);
        break;
      } catch (err) {
        const last = err.response?.data || err.message || err;
        console.warn(`Tentativa ${i + 1} falhou ao obter link do PDF:`, last);
        const isPrintFail = typeof last === 'string' ? last.includes('E-PRT-0007') : (last && JSON.stringify(last).includes('E-PRT-0007'));
        if (i < maxRetries - 1 && isPrintFail) {
          console.log(`Aguardando ${delay / 1000}s antes de nova tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }

    const etiquetaPDF = await axios.get(pdfUrl, {
      headers: { 'User-Agent': 'NewCase contato@newcase.com' },
      responseType: 'arraybuffer'
    });

    console.log('PDF da etiqueta baixado com sucesso!');

    const fileName = `etiqueta-${id}.pdf`;
    const pdfBuffer = Buffer.from(etiquetaPDF.data);
    const etiquetaUrl = await uploadEtiquetaPDF(pdfBuffer, fileName);

    console.log('Upload firebase com sucesso!:', etiquetaUrl);

    await pedidosModel.updateAdminPedido(id, { etiqueta_url: etiquetaUrl });

    console.log('Atualizado o BD com etiqueta_url!');
    return etiquetaUrl;
  } catch (error) {
    console.error('Erro ao obter PDF da etiqueta:', error.response?.data || error.message);
    throw error;
  }
}

async function melhorEnvioWebhook(req, res) {
  try {
    const secret = process.env.ME_SECRET;
    const signature = req.headers['x-me-signature'];

    if (!signature) {
      console.error('Assinatura ausente no header!');
      return res.status(400).send('Missing signature');
    }

    const bodyString = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    const hash = crypto.createHmac('sha256', secret).update(bodyString).digest('base64');

    if (hash !== signature) {
      console.error('Assinatura de webhook inválida!');
      console.error('Recebido signature:', signature);
      console.error('Calculado hash:', hash);
      return res.status(400).send('Invalid signature');
    }

    console.log('Webhook Melhor Envio recebido:', req.body);

    const event = req.body.event;
    const data = req.body.data || {};

    const etiquetaId = data.id;
    const protocol = data.protocol;
    const tracking = data.tracking;
    const status = data.status;

    if (!etiquetaId) {
      console.log('Webhook sem etiqueta_id no payload — evento:', event);
      return res.status(200).send('ok');
    }

    await pedidosModel.updatePedidoByEtiquetaId(etiquetaId, {
      frete_protocolo: protocol,
      frete_rastreio: tracking,
      frete_status: status
    });

    console.log(`Pedido atualizado para etiqueta ${etiquetaId}: protocol=${protocol}, tracking=${tracking}, status=${status}`);

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook Melhor Envio:', error);
    return res.status(500).send('Erro interno');
  }
}

module.exports = {
  obterToken,
  calcularFrete,
  gerarEtiqueta,
  melhorEnvioWebhook
};






// const connection = require('../database/connection');
// const pedidosModel = require('../models/pedidosModel');
// const { uploadEtiquetaPDF } = require("../utils/firebaseAdmin");
// const axios = require('axios');
// const crypto = require('crypto');
// require('dotenv').config();

// async function obterToken(req, res) {
//   if (!req.query.code) return res.status(400).json({ erro: 'Código de autorização não fornecido' });

//   try {
//     const response = await axios.post('https://melhorenvio.com.br/oauth/token', {
//       grant_type: 'authorization_code',
//       client_id: process.env.ME_CLIENT_ID,
//       client_secret: process.env.ME_CLIENT_SECRET,
//       redirect_uri: process.env.ME_REDIRECT_URI,
//       code: req.query.code
//     });

//     const tokenData = response.data;
    
//     const now = Math.floor(Date.now() / 1000);
//     const expiresAt = now + tokenData.expires_in;
    
//     await connection.execute('DELETE FROM token_me');
//     const [result] = await connection.execute('INSERT INTO token_me(access_token, refresh_token, expires_at) VALUES (?, ?, ?)',
//         [tokenData.access_token, tokenData.refresh_token, expiresAt]
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Erro ao obter token:', error.response?.data || error.message);
//     res.status(500).json({ erro: 'Falha ao obter token' });
//   }
// }

// async function getValidToken() {
//   const [rows] = await connection.execute('SELECT * FROM token_me LIMIT 1');
//   const token = rows[0];

//   const now = Math.floor(Date.now() / 1000);

//   if (token.expires_at <= now) {
//     try {
//       const refreshResponse = await axios.post('https://melhorenvio.com.br/oauth/token', {
//         grant_type: 'refresh_token',
//         refresh_token: token.refresh_token,
//         client_id: process.env.ME_CLIENT_ID,
//         client_secret: process.env.ME_CLIENT_SECRET
//       });

//       const newToken = refreshResponse.data;

//       const now = Math.floor(Date.now() / 1000);
//       const expiresAt = now + newToken.expires_in;
      
//       await connection.execute('UPDATE token_me SET access_token = ?, refresh_token = ?, expires_at = ?',
//         [newToken.access_token, newToken.refresh_token, expiresAt]
//       );

//       return newToken.access_token;
//     } catch (error) {
//       console.error('Erro ao atualizar token:', error.response?.data || error.message);
//       throw new Error('Falha ao atualizar token');
//     }
//   }

//   return token.access_token;
// }

// const calcularFrete = async (req, res) => {
//   const {cep_destino, peso, comprimento, altura, largura, valor} = req.body;
  
//   if (!cep_destino || !peso || !comprimento || !altura || !largura || !valor) return res.status(400).json({ erro: 'Dados incompletos para o cálculo de frete' });

//   try {
//     const accessToken = await getValidToken();
    
//     const response = await axios.post('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
//       from: {
//         postal_code: '13454-056'
//       },
//       to: {
//         postal_code: cep_destino
//       },
//       products: [
//         {
//           name: "Produto",
//           quantity: 1,
//           unitary_value: valor,
//           weight: peso,
//           length: comprimento,
//           height: altura,
//           width: largura
//         }
//       ],
//       services: "1, 2, 31, 33",
//       options: {
//         own_hand: false,
//         receipt: false,
//         insurance_value: valor
//       }
//     }, {
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       }
//     });

//     res.status(200).json(response.data);
//   } catch (err) {
//     console.error('Erro no cálculo de frete:', err.response?.data || err.message);
//     res.status(500).json({ erro: 'Falha ao calcular frete' });
//   }
// };

// const gerarEtiqueta = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const accessToken = await getValidToken();

//     const pedidos = await pedidosModel.getAdminPedidoBySearch(id);
//     const pedido = pedidos[0];
//     if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

//     let etiquetaId = pedido.etiqueta_id;

//     if (!etiquetaId) {
//       console.log("Pedido sem etiqueta. Gerando e comprando agora...");

//       const subtotal = Number(pedido.total) - Number(pedido.frete.valor);
//       const totalPeso = pedido.itens.reduce((acc, item) => acc + Number(item.produto_peso) * item.quantidade, 0);
//       const totalAltura = pedido.itens.reduce((acc, item) => acc + Number(item.produto_altura) * item.quantidade, 0);

//       const payloadAddEtiquetasCart = {
//         service: pedido.frete.frete_id,
//         from: {
//           name: 'NewCase',
//           postal_code: "13454056",
//           address: "Rua da Batata",
//           number: "123",
//           district: "Centro",
//           city: "São Paulo",
//           state_abbr: "SP"
//         },
//         to: {
//           name: pedido.destinatario.nome,
//           phone: pedido.destinatario.telefone,
//           email: pedido.destinatario.email,
//           document: pedido.destinatario.cpf,
//           address: pedido.endereco.endereco_rua,
//           number: pedido.endereco.endereco_numero,
//           district: pedido.endereco.endereco_bairro,
//           city: pedido.endereco.endereco_cidade,
//           state_abbr: pedido.endereco.endereco_estado,
//           postal_code: pedido.endereco.endereco_cep.replace(/\D/g, ''),
//           complement: pedido.endereco.endereco_complemento
//         },
//         products: pedido.itens.map(item => ({
//           name: item.nome,
//           quantity: Number(item.quantidade),
//           unitary_value: Number(item.preco_unitario)
//         })),
//         volumes: [{
//           height: totalAltura,
//           width: 12,
//           length: 25,
//           weight: totalPeso
//         }],
//         options: {
//           insurance_value: subtotal,
//           receipt: false,
//           own_hand: false,
//           reverse: false,
//           non_commercial: false
//         }
//       };

//       // Adiciona ao carrinho
//       const response = await axios.post("https://www.melhorenvio.com.br/api/v2/me/cart", payloadAddEtiquetasCart, {
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'User-Agent': 'NewCase contato@newcase.com'
//         }
//       });

//       console.log('Adicionado ao carrinho!');

//       // Checkout (compra)
//       const comprasEtiquetasCart = await axios.post("https://www.melhorenvio.com.br/api/v2/me/shipment/checkout", { orders: [response.data.id] }, {
//         headers: {
//           "Authorization": `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "User-Agent": "NewCase contato@newcase.com"
//         }
//       });

//       console.log('Etiqueta comprada!', comprasEtiquetasCart);
//       const etiquetaCompra = comprasEtiquetasCart.data[0];

//       // Gerando etiqueta
//       const etiquetaGerada = await axios.post("https://www.melhorenvio.com.br/api/v2/me/shipment/generate", { orders: [response.data.id] }, {
//         headers: {
//           "Authorization": `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "User-Agent": "NewCase contato@newcase.com"
//         }
//       });

//       console.log('Etiqueta gerada!', etiquetaGerada);
      
//       await pedidosModel.updateAdminPedido(id, {
//         etiqueta_id: etiquetaCompra.id,
//         frete_protocolo: etiquetaCompra.protocol,
//         frete_rastreio: etiquetaCompra.tracking,
//         frete_status: etiquetaCompra.status
//       });
//       console.log("Dados de rastreio e id salvos no pedido!");

//       const etiquetaUrl = await ObterEtiquetaPDF(id, accessToken, etiquetaCompra);

//       return res.status(200).json({
//         message: 'Etiqueta comprada e gerada PDF com sucesso!',
//         etiqueta_url: etiquetaUrl
//       });
//     } else {
//       console.log("Etiqueta já existente!, Gerando e obtendo arquivo para upload no storage");

//       const etiquetaUrl = await ObterEtiquetaPDF(id, accessToken, etiquetaCompra);

//       return res.status(200).json({
//         message: 'Etiqueta gerada PDF com sucesso!',
//         etiqueta_url: etiquetaUrl
//       });
//     }
//   } catch (error) {
//     console.error("Erro ao gerar etiqueta:", error.response?.data || error.message);
//     return res.status(500).json({
//       error: "Falha ao gerar etiqueta",
//       details: error.response?.data || error.message
//     });
//   }
// };

// async function ObterEtiquetaPDF(id, accessToken, etiquetaId) {
//   try {
//     const maxRetries = 3;
//     const delay = 5000;
//     let pdfUrl = null;
//     let lastError = null;

//     for (let i = 0; i < maxRetries; i++) {
//       try {
//         // Obtendo link do PDF da etiqueta
//         const etiquetaUrlDownload = await axios.get(`https://www.melhorenvio.com.br/api/v2/me/imprimir/pdf/${etiquetaId}`, {
//           headers: {
//             "Authorization": `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//             "User-Agent": "NewCase contato@newcase.com"
//           }
//         });
            
//         pdfUrl = Array.isArray(etiquetaUrlDownload.data) ? etiquetaUrlDownload.data[0] : etiquetaUrlDownload.data.url || etiquetaUrlDownload.data;

//         console.log('Link PDF obtido!');
//         break;
//       } catch (error) {
//         lastError = error.response?.data || error.message;
//         const isPrintFail = lastError.message?.includes('E-PRT-0007') || error.response?.status >= 500;
//         if (i < maxRetries - 1 && isPrintFail) {
//           console.log(`Tentativa ${i + 1} falhou com erro de impressão. Aguardando ${delay / 1000}s para tentar novamente...`);
//           await new Promise(resolve => setTimeout(resolve, delay));
//         } else {
//           throw error;
//         }
//       }
//     }

//     // Baixando arquivo PDF
//     const etiquetaPDF = await axios.get(pdfUrl, {
//       headers: { "User-Agent": "NewCase contato@newcase.com" },
//       responseType: "arraybuffer"
//     });

//     console.log('PDF da etiqueta baixado com sucesso!');

//     const fileName = `etiqueta-${id}.pdf`;
//     const pdfBuffer = Buffer.from(etiquetaPDF.data);
//     const etiquetaUrl = await uploadEtiquetaPDF(pdfBuffer, fileName);

//     console.log('Upload firebase com sucesso!:', etiquetaUrl)
    
//     await pedidosModel.updateAdminPedido(id, { etiqueta_url: etiquetaUrl });

//     console.log('Atualizado o BD!');
//     return etiquetaUrl;
//   } catch (error) {
//     console.error("Erro ao obter PDF da etiqueta:", error.response?.data || error.message);
//     throw error;
//   }
// };

// async function melhorEnvioWebhook(req, res) {
//   try {
//     const secret = process.env.ME_CLIENT_SECRET; 
//     const signature = req.headers['x-me-signature'];

//     if (!signature) {
//       console.error("Assinatura ausente no header!");
//       return res.status(400).send("Missing signature");
//     }

//     const body = JSON.stringify(req.body);

//     const hash = crypto
//       .createHmac('sha256', secret)
//       .update(body)
//       .digest('base64');

//     if (hash !== signature) {
//       console.error('Assinatura de webhook inválida!');
//       return res.status(400).send('Invalid signature');
//     }

//     console.log('Webhook Melhor Envio recebido:', req.body);

//     const data = req.body.data;

//     const etiquetaId = data.id;
//     const protocol = data.protocol;
//     const tracking = data.tracking;
//     const status = data.status;

//     await pedidosModel.updatePedidoByEtiquetaId(etiquetaId, {
//       frete_protocolo: protocol,
//       frete_rastreio: tracking,
//       frete_status: status
//     });

//     return res.status(200).send('OK');
//   } catch (error) {
//     console.error('Erro no webhook Melhor Envio:', error);
//     return res.status(500).send('Erro interno');
//   }
// };

// module.exports = {
//   obterToken,
//   calcularFrete,
//   gerarEtiqueta,
//   melhorEnvioWebhook
// };
