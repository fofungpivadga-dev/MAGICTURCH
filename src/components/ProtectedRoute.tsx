import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'painter' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/join" replace />;

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'painter' && user.role !== 'painter' && user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
