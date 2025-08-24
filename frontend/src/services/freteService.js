import api from '../hooks/useApi';

export async function calcularFrete(pacote = {}) {
  const { cep_destino, peso, comprimento, altura, largura, valor } = pacote || {};

  if ([cep_destino, peso, comprimento, altura, largura, valor].some(v => v == null)) {
    throw new Error('Dados incompletos para calcular frete');
  }

  const response =await api.post('/calcular-frete',
    { 
      cep_destino,
      peso,
      comprimento,
      altura,
      largura,
      valor
    }
  );
  
  return response.data;
}
