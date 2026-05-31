import { useAuthStore } from '@/shared/stores/auth.store';

export const usePermiso = () => {
  const rol = useAuthStore((s) => s.usuario?.rol);
  return {
    puedeCrearVenta: ['ADMIN', 'CAJERO', 'SUPERVISOR'].includes(rol ?? ''),
    puedeAnularVenta: ['ADMIN', 'SUPERVISOR'].includes(rol ?? ''),
    puedeVerAuditoria: ['ADMIN', 'SUPERVISOR'].includes(rol ?? ''),
    puedeGestionarProductos: ['ADMIN', 'ALMACENERO'].includes(rol ?? ''),
    puedeGestionarUsuarios: ['ADMIN'].includes(rol ?? ''),
    puedeVerReportes: ['ADMIN', 'SUPERVISOR'].includes(rol ?? ''),
    puedeGestionarCompras: ['ADMIN', 'ALMACENERO'].includes(rol ?? ''),
  };
};
