import type { Rol } from '@/shared/types/domain.types';

export const ROLES: Record<Rol, string> = {
  ADMIN: 'Administrador',
  CAJERO: 'Cajero',
  ALMACENERO: 'Almacenero',
  SUPERVISOR: 'Supervisor',
} as const;

export const ROLE_HIERARCHY: Record<Rol, number> = {
  ADMIN: 4,
  SUPERVISOR: 3,
  ALMACENERO: 2,
  CAJERO: 1,
};
