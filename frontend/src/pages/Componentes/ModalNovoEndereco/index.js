import React, { useState, useEffect } from 'react';
import './modalNovoEndereco.css';

const ModalNovoEndereco = ({ enderecoInicial = null, onSave, onCancel }) => {
  const [endereco, setEndereco] = useState(enderecoInicial || {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [erroCep, setErroCep] = useState('');

  useEffect(() => {
    if (enderecoInicial) {
      setEndereco(enderecoInicial);
    }
  }, [enderecoInicial]);

  const formatarCep = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 5) return apenasNumeros;
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      const cepFormatado = formatarCep(value);
      const numeros = cepFormatado.replace(/\D/g, '');
      setEndereco(prev => ({ ...prev, cep: cepFormatado }));

      if (numeros.length === 8) {
        fetch(`https://viacep.com.br/ws/${numeros}/json/`)
          .then(res => res.json())
          .then(data => {
            if (!data.erro) {
              setEndereco(prev => ({
                ...prev,
                rua: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || ''
              }));
              setErroCep('');
            } else {
              setErroCep('CEP inválido');
              setEndereco(prev => ({
                ...prev,
                rua: '',
                bairro: '',
                cidade: '',
                estado: ''
              }));
            }
          })
          .catch(err => {
            console.error('Erro ao buscar CEP:', err);
            setErroCep('Erro ao buscar o CEP');
          });
      } else {
        setErroCep('');
      }
    } else {
      setEndereco(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(endereco);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{enderecoInicial ? 'Editar Endereço' : 'Novo Endereço'}</h2>
        <form onSubmit={handleSubmit}>
          <input name="cep" placeholder="CEP" value={endereco.cep} className={erroCep ? 'erro' : ''} onChange={handleChange} maxLength={9} required />
          {erroCep && <span className="mensagem-erro">{erroCep}</span>}
          <input name="rua" placeholder="Rua" value={endereco.rua} readOnly />
          <input name="numero" placeholder="Número" value={endereco.numero} onChange={handleChange} required />
          <input name="complemento" placeholder="Complemento" value={endereco.complemento} onChange={handleChange} />
          <input name="bairro" placeholder="Bairro" value={endereco.bairro} readOnly />
          <input name="cidade" placeholder="Cidade" value={endereco.cidade} readOnly />
          <input name="estado" placeholder="Estado" value={endereco.estado} readOnly />
          <div className="modal-buttons">
            <button type="submit">Salvar</button>
            <button type="button" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovoEndereco;
