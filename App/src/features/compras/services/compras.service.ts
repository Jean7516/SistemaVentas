import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Compra, Producto, Proveedor } from '@/shared/types/domain.types';
import type { CrearCompraRequest, ProveedorFormData } from '../types/compra.types';

interface CompraQueryParams {
  page?: number;
  size?: number;
  estado?: string;
}

interface ProveedorQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export const comprasService = {
  getAll: (params?: CompraQueryParams) =>
    api.get<Compra, ApiResponse<PaginatedResponse<Compra>>>('/compras', { params }),

  getById: (id: number) =>
    api.get<Compra, ApiResponse<Compra>>(`/compras/${id}`),

  create: (data: CrearCompraRequest) =>
    api.post<Compra, ApiResponse<Compra>>('/compras', data),

  recibir: (id: number) =>
    api.put<void, ApiResponse<void>>(`/compras/${id}/recibir`),

  getAllProveedores: (params?: ProveedorQueryParams) =>
    api.get<Proveedor, ApiResponse<PaginatedResponse<Proveedor>>>('/proveedores', { params }),

  getProveedor: (id: number) =>
    api.get<Proveedor, ApiResponse<Proveedor>>(`/proveedores/${id}`),

  createProveedor: (data: ProveedorFormData) =>
    api.post<Proveedor, ApiResponse<Proveedor>>('/proveedores', data),

  updateProveedor: (id: number, data: ProveedorFormData) =>
    api.put<Proveedor, ApiResponse<Proveedor>>(`/proveedores/${id}`, data),

  deleteProveedor: (id: number) =>
    api.delete<void, ApiResponse<void>>(`/proveedores/${id}`),

  buscarProductos: (search: string) =>
    api.get<Producto, ApiResponse<PaginatedResponse<Producto>>>('/productos', {
      params: { search, size: 20 },
    }),
};
