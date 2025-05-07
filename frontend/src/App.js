import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Routas from './Routes';

function App() {
  return (
    <AuthProvider>
      <Routas />
    </AuthProvider>
    );
}

export default App;
