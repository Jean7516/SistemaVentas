import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Categoria, Producto, UnidadMedida } from '@/shared/types/domain.types';
import type { ProductoFormData } from '../schemas/producto.schema';

interface ProductoQueryParams {
  page?: number;
  size?: number;
  search?: string;
  categoria?: number;
}

export const productosService = {
  getAll: (params?: ProductoQueryParams) =>
    api.get<Producto, ApiResponse<PaginatedResponse<Producto>>>('/productos', { params }),

  getById: (id: number) =>
    api.get<Producto, ApiResponse<Producto>>(`/productos/${id}`),

  getByBarras: (codigo: string) =>
    api.get<Producto, ApiResponse<Producto>>(`/productos/barras/${codigo}`),

  create: (data: ProductoFormData) =>
    api.post<Producto, ApiResponse<Producto>>('/productos', data),

  update: (id: number, data: ProductoFormData) =>
    api.put<Producto, ApiResponse<Producto>>(`/productos/${id}`, data),

  remove: (id: number) =>
    api.delete<void, ApiResponse<void>>(`/productos/${id}`),

  getCategorias: () =>
    api.get<Categoria[], ApiResponse<Categoria[]>>('/categorias'),

  getUnidadesMedida: () =>
    api.get<UnidadMedida[], ApiResponse<UnidadMedida[]>>('/unidades-medida'),
};
