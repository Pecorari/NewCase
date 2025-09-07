require('dotenv').config();

function montarBodyPagbank(pedido, itensPedido, metodo, cliente, endereco_entrega, pagamento) {

  const taxId = (cliente.cpf || "").replace(/\D/g, "");
  if (taxId.length !== 11) {
    return res.status(400).json({ error: "CPF inválido" });
  }

  const telefoneNumeros =(cliente.telefone || '').replace(/\D/g, "");
  const ddd = telefoneNumeros.substring(0, 2) || '99';
  const numero = telefoneNumeros.substring(2) || '999999999';

  const items = itensPedido.map((item, idx) => ({
    reference_id: item.produto_id,
    name: `Produto ${item.produto_id}`,
    quantity: item.quantidade,
    unit_amount: Math.round(Number(item.preco_unitario) * 100)
  }));

  const body = {
    reference_id: String(pedido.id),
    customer: {
      name: cliente.nome,
      email: cliente.email,
      tax_id: taxId,
      phones: [
        {
          country: "55",
          area: ddd,
          number: numero,
          type: "MOBILE"
        }
      ]
    },
    items,
    shipping: {
      address: {
        street: endereco_entrega.rua,
        number: endereco_entrega.numero,
        locality: endereco_entrega.bairro,
        city: endereco_entrega.cidade,
        region_code: endereco_entrega.estado,
        country: "BRA",
        postal_code: endereco_entrega.cep.replace(/\D/g, "")
      }
    },
    notification_urls: [
      process.env.PAGBANK_NOTIFICATION
    ],
  };

  // adiciona pagamento

  if (metodo === "cartao") {
    body.charges = [
      {
        reference_id: pedido.id,
        description: "Pagamento do pedido via cartão",
        amount: {
          value: Math.round(Number(pedido.total) * 100),
          currency: "BRL",
        },
        payment_method: {
          type: "CREDIT_CARD",
          installments: 1,
          capture: true,
          card: {
            encrypted: pagamento.encrypted,
            store: false
          },
          holder: {
            name: pagamento.titular,
            tax_id: taxId
          }
        },
      },
    ];
  }

  if (metodo === "boleto") {
    body.charges = [
      {
        reference_id: pedido.id,
        description: "Pagamento do pedido via boleto",
        amount: {
          value: Math.round(Number(pedido.total) * 100),
          currency: "BRL",
        },
        payment_method: {
          type: "BOLETO",
          boleto: {
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            isntruction_lines: {
              line_1: "Pagamento do pedido",
              line_2: "YourCase",
            },
            holder: {
              name: cliente.nome,
              tax_id: taxId,
              email: cliente.email,
              address: {
                country: "Brasil",
                region: endereco_entrega.estado,
                region_code: endereco_entrega.estado,
                city: endereco_entrega.cidade,
                postal_code: endereco_entrega.cep.replace(/\D/g, ""),
                street: endereco_entrega.rua,
                number: endereco_entrega.numero,
                locality:  endereco_entrega.bairro
              }
            }
          },
        },
      },
    ];
  }

  if (metodo === "pix") {
    const date = new Date(Date.now() + 1 * 60 * 60 * 1000);
      
    const expirationDate = Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date).replace(" ", "T") + "-03:00";
    
    body.qr_codes = [
      {
        amount: {
          value: Math.round(Number(pedido.total) * 100),
          currency: 'BRL'
        },
        expiration_date: expirationDate,
        arrangements: ["PAGBANK"]
      }
    ];
  }


  return body;
}

module.exports = montarBodyPagbank;
