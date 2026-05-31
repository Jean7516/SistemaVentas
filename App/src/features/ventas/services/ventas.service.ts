import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Venta, Producto } from '@/shared/types/domain.types';
import type { CrearVentaRequest, AnularVentaRequest } from '../types/venta.types';

interface VentaQueryParams {
  page?: number;
  size?: number;
  turno?: number;
  search?: string;
  sort?: string;
}

export const ventasService = {
  getAll: (params?: VentaQueryParams) =>
    api.get<void, ApiResponse<PaginatedResponse<Venta>>>('/ventas', { params }),

  getById: (id: number) =>
    api.get<void, ApiResponse<Venta>>(`/ventas/${id}`),

  create: (data: CrearVentaRequest) =>
    api.post<void, ApiResponse<Venta>>('/ventas', data),

  anular: (id: number, data: AnularVentaRequest) =>
    api.put<void, ApiResponse<Venta>>(`/ventas/${id}/anular`, data),

  getProductoByBarras: (codigo: string) =>
    api.get<void, ApiResponse<Producto>>(`/productos/barras/${codigo}`),

  searchProductos: (query: string) =>
    api.get<void, ApiResponse<PaginatedResponse<Producto>>>('/productos', { params: { search: query, size: 10 } }),
};
