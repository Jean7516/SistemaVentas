import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { ProtectedRoute } from '@/shared/components/layout/ProtectedRoute';
import { ROUTES } from '@/shared/constants/routes';
import type { Rol } from '@/shared/types/domain.types';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { DashboardPage } from '@/features/ventas/components/DashboardPage';
import { PosPage } from '@/features/ventas/components/PosPage';
import { VentasPage } from '@/features/ventas/components/VentasPage';
import { VentaDetallePage } from '@/features/ventas/components/VentaDetallePage';
import { CajaPage } from '@/features/caja/components/CajaPage';
import { ProductosPage } from '@/features/productos/components/ProductosPage';
import { ProductoFormPage } from '@/features/productos/components/ProductoFormPage';
import { ComprasPage } from '@/features/compras/components/ComprasPage';
import { CompraFormPage } from '@/features/compras/components/CompraFormPage';
import { ProveedoresPage } from '@/features/compras/components/ProveedoresPage';
import { ReportesPage } from '@/features/reportes/components/ReportesPage';
import { AuditoriaPage } from '@/features/auditoria/components/AuditoriaPage';
import { UsuariosPage } from '@/features/usuarios/components/UsuariosPage';

function RutaProtegida({ children, roles }: { children: React.ReactNode; roles?: Rol[] }) {
  return (
    <ProtectedRoute roles={roles}>
      {children}
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route
          path={ROUTES.POS}
          element={
            <RutaProtegida roles={['ADMIN', 'CAJERO', 'SUPERVISOR']}>
              <PosPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.VENTAS}
          element={
            <RutaProtegida roles={['ADMIN', 'SUPERVISOR']}>
              <VentasPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/ventas/:id"
          element={
            <RutaProtegida roles={['ADMIN', 'SUPERVISOR']}>
              <VentaDetallePage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.CAJA}
          element={
            <RutaProtegida roles={['ADMIN', 'CAJERO', 'SUPERVISOR']}>
              <CajaPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.PRODUCTOS}
          element={
            <RutaProtegida roles={['ADMIN', 'ALMACENERO']}>
              <ProductosPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.PRODUCTO_NUEVO}
          element={
            <RutaProtegida roles={['ADMIN', 'ALMACENERO']}>
              <ProductoFormPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/productos/:id"
          element={
            <RutaProtegida roles={['ADMIN', 'ALMACENERO']}>
              <ProductoFormPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.COMPRAS}
          element={
            <RutaProtegida roles={['ADMIN', 'ALMACENERO', 'SUPERVISOR']}>
              <ComprasPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.COMPRA_NUEVA}
          element={
            <RutaProtegida roles={['ADMIN', 'ALMACENERO']}>
              <CompraFormPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.PROVEEDORES}
          element={
            <RutaProtegida roles={['ADMIN', 'ALMACENERO']}>
              <ProveedoresPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.REPORTES}
          element={
            <RutaProtegida roles={['ADMIN', 'SUPERVISOR']}>
              <ReportesPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.AUDITORIA}
          element={
            <RutaProtegida roles={['ADMIN', 'SUPERVISOR']}>
              <AuditoriaPage />
            </RutaProtegida>
          }
        />
        <Route
          path={ROUTES.USUARIOS}
          element={
            <RutaProtegida roles={['ADMIN']}>
              <UsuariosPage />
            </RutaProtegida>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
