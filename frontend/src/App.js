import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import Routas from './Routes';

import './assets/styles/base.css';
import './assets/styles/variables.css';

function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Routas />
      </CarrinhoProvider>
    </AuthProvider>
    );
}

export default App;
