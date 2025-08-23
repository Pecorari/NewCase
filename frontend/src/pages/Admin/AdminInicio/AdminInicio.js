import React, { useEffect, useState } from 'react';
import api from '../../../hooks/useApi';

import './AdminInicio.css';

const AdminInicio = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    produtos: 0,
    pedidos: 0,
    aparelhos: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/statsAdmin');
        setStats(response.data);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-inicio">
      <h2>Resumo do Painel</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Usuários</h3>
          <p>{stats.usuarios}</p>
        </div>
        <div className="stat-card">
          <h3>Produtos</h3>
          <p>{stats.produtos}</p>
        </div>
        <div className="stat-card">
          <h3>Pedidos</h3>
          <p>{stats.pedidos}</p>
        </div>
        <div className="stat-card">
          <h3>Aparelhos</h3>
          <p>{stats.aparelhos}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminInicio;
