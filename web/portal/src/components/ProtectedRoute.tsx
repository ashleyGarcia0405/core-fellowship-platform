import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole, UserType } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredUserType?: UserType;
}

export default function ProtectedRoute({ children, requiredRole, requiredUserType }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requiredUserType && user.userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}