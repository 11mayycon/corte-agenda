import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserType } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: UserType[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedTypes = [], 
  redirectTo = '/login/usuario' 
}) => {
  const { user, loading, userType } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedTypes.length > 0 && userType && !allowedTypes.includes(userType)) {
    // Redirecionar para a página correta baseada no tipo de usuário
    const redirectMap: Record<UserType, string> = {
      admin: '/admin/visao-geral',
      salao: '/loja/agenda',
      cliente: '/cliente/agendar'
    };
    
    return <Navigate to={redirectMap[userType]} replace />;
  }

  return <>{children}</>;
};

// Componentes específicos para cada tipo de usuário
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['admin']} redirectTo="/login/administrador">
    {children}
  </ProtectedRoute>
);

export const SalaoRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['salao']} redirectTo="/login/cabeleireiro">
    {children}
  </ProtectedRoute>
);

export const ClienteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['cliente']} redirectTo="/login/usuario">
    {children}
  </ProtectedRoute>
);