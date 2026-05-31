import { NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useUiStore } from '@/shared/stores/ui.store';
import { usePermiso } from '@/shared/hooks/usePermiso';
import { ROUTES } from '@/shared/constants/routes';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CAJERO', 'ALMACENERO', 'SUPERVISOR'] },
  { to: ROUTES.POS, label: 'Punto de Venta', icon: ShoppingCart, roles: ['ADMIN', 'CAJERO', 'SUPERVISOR'] },
  { to: ROUTES.VENTAS, label: 'Ventas', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR'] },
  { to: ROUTES.PRODUCTOS, label: 'Productos', icon: Package, roles: ['ADMIN', 'ALMACENERO'] },
  { to: ROUTES.COMPRAS, label: 'Compras', icon: Warehouse, roles: ['ADMIN', 'ALMACENERO', 'SUPERVISOR'] },
  { to: ROUTES.PROVEEDORES, label: 'Proveedores', icon: Users, roles: ['ADMIN', 'ALMACENERO'] },
  { to: ROUTES.CAJA, label: 'Caja', icon: DollarSign, roles: ['ADMIN', 'CAJERO', 'SUPERVISOR'] },
  { to: ROUTES.REPORTES, label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'SUPERVISOR'] },
  { to: ROUTES.AUDITORIA, label: 'Auditoría', icon: FileText, roles: ['ADMIN', 'SUPERVISOR'] },
  { to: ROUTES.USUARIOS, label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
];

export function Sidebar() {
  const usuario = useAuthStore((s) => s.usuario);
  const { sidebarColapsado, toggleSidebar } = useUiStore();
  const { puedeGestionarUsuarios } = usePermiso();

  const rol = usuario?.rol ?? '';
  console.log("res: "+usuario)
  const visibleItems = navItems.filter((item) => {
    if (item.to === ROUTES.USUARIOS) return puedeGestionarUsuarios;
    return item.roles.includes(rol);
  });
  console.log("res: "+visibleItems)
  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 text-white ',
        sidebarColapsado ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center border-b px-4 bg-[#514390]">
        {!sidebarColapsado && (
          <span className="font-bold text-lg truncate">Bodega Sistema</span>
        )}  
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1 rounded-md hover:bg-accent',
            sidebarColapsado ? 'mx-auto' : 'ml-auto',
          )}
        >
          {sidebarColapsado ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2 bg-[#6e5cc2]  ">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[#9784eb] text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
                sidebarColapsado && 'justify-center px-2',
              )
            }
            title={sidebarColapsado ? item.label : undefined}
          >
            <item.icon size={20} />
            {!sidebarColapsado && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
