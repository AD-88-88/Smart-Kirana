import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export function OwnerRoute({ children }) {
  const { user, loading, role } = useAuth();

  // Development-only bypass logic
  const isDevBypass = import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_ADMIN_BYPASS === 'true';

  if (loading) return <Loader label="Verifying access..." />;
  
  if (isDevBypass) return children;

  if (!user) return <Navigate to="/login" replace />;
  
  return role === 'owner' ? children : <Navigate to="/" replace />;
}
