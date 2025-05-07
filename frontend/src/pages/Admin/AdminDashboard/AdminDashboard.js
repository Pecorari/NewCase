import React, { useState } from 'react';
import AdminProdutos from '../AdminProdutos/AdminProdutos';
import AdminAparelhos from '../AdminAparelhos/AdminAparelhos';
import AdminCategorias from '../AdminCategorias/AdminCategorias';
import AdminPedidos from '../AdminPedidos/AdminPedidos';
import AdminUsuarios from '../AdminUsuarios/AdminUsuarios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [abaAtiva, setAbaAtiva] = useState('produtos');

  const renderConteudo = () => {
    switch (abaAtiva) {
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
      <h1>Painel do Admin</h1>
      <div className="admin-tabs">
        <button onClick={() => setAbaAtiva('produtos')}>Produtos</button>
        <button onClick={() => setAbaAtiva('aparelhos')}>Aparelhos</button>
        <button onClick={() => setAbaAtiva('categorias')}>Categorias</button>
        <button onClick={() => setAbaAtiva('pedidos')}>Pedidos</button>
        <button onClick={() => setAbaAtiva('usuarios')}>Usuários</button>
      </div>

      <div className="admin-content">
        {renderConteudo()}
      </div>
    </div>
  );
};

export default AdminDashboard;