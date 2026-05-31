import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { productosService } from '../services/productos.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Producto } from '@/shared/types/domain.types';

interface UseProductosParams {
  page?: number;
  size?: number;
  search?: string;
  categoria?: number;
}

export function useProductos(params: UseProductosParams = {}) {
  return useQuery<PaginatedResponse<Producto>>({
    queryKey: queryKeys.productos.list(params),
    queryFn: () => productosService.getAll(params).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
