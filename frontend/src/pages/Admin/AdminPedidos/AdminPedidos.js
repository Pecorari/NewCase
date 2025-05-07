import React, { useEffect, useState } from 'react';

import api from '../../../hooks/useApi';

import './AdminPedidos.css';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    cliente_id: ''
  });

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    try {
      const response = await api.get('/pedidosAdmin');
      setPedidos(response.data);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao buscar pedidos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    e.preventDefault();
    
    if (form.cliente_id.trim() === '') {
      buscarPedidos();
      setPedido([]);
      return;
    }

    try {

      const response = await api.get(`/pedidosAdmin/user/${form.cliente_id}`);

      setForm({cliente_id: ''});
      setPedido(response.data);
    } catch (err) {
      setErro(err.response.data.mensagem);
      console.error('Erro ao adicionar pedido:', err);
    }
  };

  return (
    <div className='admin-container'>
      {erro ? <span className='erro'>{erro}</span> : <></>}
      <h2 className='title-admin-pedido'>Buscar Pedido</h2>
      <form className='form-admin-pedido' onSubmit={handleSubmit}>
        <input className='input-admin-pedido' type="text" name="cliente_id" placeholder="Cliente ID" value={form.cliente_id} onChange={handleInputChange} required />
        <button className='form-btn-admin-pedido' type="submit">Buscar</button>
      </form>

      <br/><br/><hr/><br/><br/>

      <h2 className='title-admin-pedido'>Lista de pedidos</h2>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido feito.</p>
      ) : (
        <ul className='ul-admin-pedido'>
          {pedido.length !== 0  ? (
            <li className='li-admin-pedido'>
              <div className='dados-pedidos'>
                <p>{pedido.id}<br/>{pedido.usuario_id}<br/>{pedido.total}<br/>{pedido.status}<br/>{pedido.criado_em}</p>
                <p>{pedido.itens[0].id}<br/>{pedido.itens[0].pedido_id}<br/>{pedido.itens[0].quantidade}</p>
                <p>{pedido.pagamento.id}<br/>{pedido.pagamento.pedido_id}<br/>{pedido.pagamento.metodo_pagamento}<br/>{pedido.pagamento.valor_pago}<br/>{pedido.pagamento.pago_em}</p>
              </div>
            </li> ) : pedidos.map((pedido) => (
            <li className='li-admin-pedido' key={pedido.id}>
              <div className='dados-pedidos'>
                <p>{pedido.id}<br/>{pedido.usuario_id}<br/>{pedido.total}<br/>{pedido.status}<br/>{pedido.criado_em}</p>
                <p>{pedido.itens[0].id}<br/>{pedido.itens[0].pedido_id}<br/>{pedido.itens[0].quantidade}</p>
                <p>{pedido.pagamento.id}<br/>{pedido.pagamento.pedido_id}<br/>{pedido.pagamento.metodo_pagamento}<br/>{pedido.pagamento.valor_pago}<br/>{pedido.pagamento.pago_em}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPedidos;
