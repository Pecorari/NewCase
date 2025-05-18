import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import Routas from './Routes';

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
