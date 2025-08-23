import React, { useEffect, useState } from 'react';

import './sidebarFiltros.css';


const SidebarFiltros = ({
  ativo,
  setAtivo,
  categorias,
  handleCategoriaChange,
  handlePrecoChange,
  handleCorChange,
  limparFiltros,
}) => {
  const [larguraTela, setLarguraTela] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setLarguraTela(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mostrarSidebar = larguraTela >= 768 || ativo;

  return (
    <aside className={`sidebar ${mostrarSidebar ? 'ativo' : ''}`}>
      <div className='sidebar-content'>
        <button className="btn-fechar-filtros" onClick={() => setAtivo(false)}>x</button>

        <div className="filtro-grupo">
          <h3>Categoria</h3>
          <ul>
            {categorias.map((categoria) => (
              <li key={categoria.id} onClick={() => handleCategoriaChange(categoria.nome)}>
                {categoria.nome}
              </li>
            ))}
          </ul>
        </div>

        <div className="filtro-grupo">
          <h3>Preço</h3>
          <label><input type="radio" name="preco" onChange={() => handlePrecoChange(0, 15)} /> Até R$15</label><br />
          <label><input type="radio" name="preco" onChange={() => handlePrecoChange(15, 25)} /> R$15 a R$25</label><br />
          <label><input type="radio" name="preco" onChange={() => handlePrecoChange(25, 35)} /> R$25 a R$35</label><br />
          <label><input type="radio" name="preco" onChange={() => handlePrecoChange(35, 50)} /> R$35 a R$50</label><br />
          <label><input type="radio" name="preco" onChange={() => handlePrecoChange(50, 1000)} /> Acima de R$50</label>
        </div>

        <div className="filtro-grupo">
          <h3>Cores</h3>
          <div className="color-dots">
            <span onClick={() => handleCorChange('Azul')} className="dot blue"></span>
            <span onClick={() => handleCorChange('Rosa')} className="dot pink"></span>
            <span onClick={() => handleCorChange('Vermelho')} className="dot red"></span>
            <span onClick={() => handleCorChange('Verde')} className="dot green"></span>
            <span onClick={() => handleCorChange('Laranja')} className="dot orange"></span>
          </div>
        </div>

        <button className='reset-filter' onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>
    </aside>
  );
};

export default SidebarFiltros;
