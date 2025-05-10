import api from '../hooks/useApi';

export async function calcularFrete(cepDestino, produto) {
  const response =await api.post('/calcular-frete',
    { cep_destino: cepDestino,
      peso: produto.peso,
      comprimento: produto.comprimento,
      altura: produto.altura,
      largura: produto.largura,
      valor: produto.preco
    }
  );
  
  return response.data;
}
