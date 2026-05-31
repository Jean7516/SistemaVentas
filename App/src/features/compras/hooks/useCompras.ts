import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { comprasService } from '../services/compras.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Compra } from '@/shared/types/domain.types';

interface UseComprasParams {
  page?: number;
  size?: number;
  estado?: string;
}

export function useCompras(params: UseComprasParams = {}) {
  return useQuery<PaginatedResponse<Compra>>({
    queryKey: queryKeys.compras.list(params),
    queryFn: () => comprasService.getAll(params).then((r) => r.data),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
