import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { ventasService } from '../services/ventas.service';
import type { Venta } from '@/shared/types/domain.types';

export function useVenta(id: number | undefined) {
  return useQuery<Venta>({
    queryKey: queryKeys.ventas.detail(id!),
    queryFn: () => ventasService.getById(id!).then((r) => r.data),
    enabled: !!id,
  });
}
