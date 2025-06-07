// components/PublicOnlyRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && (role === 'user' || role === 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
