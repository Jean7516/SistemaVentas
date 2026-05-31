import type { Rol } from '@/shared/types/domain.types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  idUsuario: number;
  username: string;
  rol: Rol;
}
