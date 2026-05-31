import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROLES } from '@/shared/constants/roles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

export function Topbar() {
  const { usuario, logout } = useAuthStore();

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-6 bg-[#514390] ">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#9784eb] rounded-md px-3 py-1.5 text-white">
            <User size={18} />
            <span className="font-medium">{usuario?.nombreCompleto}</span>
            <span className="text-muted">
              ({usuario?.rol ? ROLES[usuario.rol] : ''})
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={logout}>
            <LogOut size={16} className="mr-2 text-slate-900 hover:text-black" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
