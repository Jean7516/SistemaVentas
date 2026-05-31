import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ROUTES } from '@/shared/constants/routes';

export function AppLayout() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
