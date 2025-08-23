import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminInicio from '../AdminInicio/AdminInicio';
import AdminProdutos from '../AdminProdutos/AdminProdutos';
import AdminAparelhos from '../AdminAparelhos/AdminAparelhos';
import AdminCategorias from '../AdminCategorias/AdminCategorias';
import AdminPedidos from '../AdminPedidos/AdminPedidos';
import AdminUsuarios from '../AdminUsuarios/AdminUsuarios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  const navigate = useNavigate();

  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'inicio':
        return <AdminInicio />;
      case 'produtos':
        return <AdminProdutos />;
      case 'aparelhos':
        return <AdminAparelhos />;
      case 'categorias':
        return <AdminCategorias />;
      case 'pedidos':
        return <AdminPedidos />;
      case 'usuarios':
        return <AdminUsuarios />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <button className='btn-sairDash' onClick={() => navigate('/')}>Sair</button>
      <h1>Painel do Admin</h1>
      <div className="admin-tabs">
        <button className={abaAtiva === 'inicio' ? 'ativo' : ''} onClick={() => setAbaAtiva('inicio')}>Inicio</button>
        <button className={abaAtiva === 'produtos' ? 'ativo' : ''} onClick={() => setAbaAtiva('produtos')}>Produtos</button>
        <button className={abaAtiva === 'aparelhos' ? 'ativo' : ''} onClick={() => setAbaAtiva('aparelhos')}>Aparelhos</button>
        <button className={abaAtiva === 'categorias' ? 'ativo' : ''} onClick={() => setAbaAtiva('categorias')}>Categorias</button>
        <button className={abaAtiva === 'pedidos' ? 'ativo' : ''} onClick={() => setAbaAtiva('pedidos')}>Pedidos</button>
        <button className={abaAtiva === 'usuarios' ? 'ativo' : ''} onClick={() => setAbaAtiva('usuarios')}>Usuários</button>
      </div>

      <div className="admin-content">
        {renderConteudo()}
      </div>
    </div>
  );
};

export default AdminDashboard;
