import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Usuario } from '@/shared/types/domain.types';
import type { CrearUsuarioRequest, ActualizarUsuarioRequest } from '../types/usuarios.types';

interface UsuarioQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export const usuariosService = {
  getAll: (params?: UsuarioQueryParams) =>
    api.get<Usuario, ApiResponse<PaginatedResponse<Usuario>>>('/usuarios', { params }),

  create: (data: CrearUsuarioRequest) =>
    api.post<Usuario, ApiResponse<Usuario>>('/usuarios', data),

  update: (id: number, data: ActualizarUsuarioRequest) =>
    api.put<Usuario, ApiResponse<Usuario>>(`/usuarios/${id}`, data),

  remove: (id: number) =>
    api.delete<void, ApiResponse<void>>(`/usuarios/${id}`),
};
