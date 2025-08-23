import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <p>Carregando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && usuario.tipo !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}
