import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { comprasService } from '../services/compras.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Proveedor } from '@/shared/types/domain.types';

interface UseProveedoresParams {
  page?: number;
  size?: number;
  search?: string;
}

export function useProveedores(params: UseProveedoresParams = {}) {
  return useQuery<PaginatedResponse<Proveedor>>({
    queryKey: queryKeys.proveedores.list(params),
    queryFn: () => comprasService.getAllProveedores(params).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
