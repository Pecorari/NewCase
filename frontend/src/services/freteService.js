import api from '../hooks/useApi';

export async function calcularFrete(cepDestino, produto) {
  const response =await api.post('https://mycell-store-700054947412.us-west1.run.app/calcular-frete',
    { cep_destino: cepDestino,
      peso: produto.peso,
      comprimento: produto.comprimento,
      altura: produto.altura,
      largura: produto.largura,
      valor: produto.valor
    }
  );
  
  return response.data;
}
