import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export function OwnerRoute({ children }) {
  const { user, loading, role } = useAuth();

  if (loading) return <Loader label="Verifying access..." />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  return role === 'owner' ? children : <Navigate to="/" replace />;
}
