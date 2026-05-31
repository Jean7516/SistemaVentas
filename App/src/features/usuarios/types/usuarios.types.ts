import type { Rol } from '@/shared/types/domain.types';

export interface CrearUsuarioRequest {
  nombreCompleto: string;
  username: string;
  password: string;
  rol: Rol;
}

export interface ActualizarUsuarioRequest {
  nombreCompleto?: string;
  password?: string;
  rol?: Rol;
  activo?: boolean;
}
