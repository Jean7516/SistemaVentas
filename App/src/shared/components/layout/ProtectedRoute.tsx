import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { Rol } from '@/shared/types/domain.types';
import { ROUTES } from '@/shared/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Rol[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { token, usuario } = useAuthStore();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (roles && usuario && !roles.includes(usuario.rol)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
