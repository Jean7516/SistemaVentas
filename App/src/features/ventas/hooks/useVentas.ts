import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { ventasService } from '../services/ventas.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Venta } from '@/shared/types/domain.types';

interface UseVentasParams {
  page?: number;
  size?: number;
  turno?: number;
  search?: string;
  sort?: string;
}

export function useVentas(params: UseVentasParams = {}) {
  return useQuery<PaginatedResponse<Venta>>({
    queryKey: queryKeys.ventas.list(params),
    queryFn: () => ventasService.getAll(params).then((r) => r.data),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
