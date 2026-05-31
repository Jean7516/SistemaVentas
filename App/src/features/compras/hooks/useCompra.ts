import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { comprasService } from '../services/compras.service';
import type { Compra } from '@/shared/types/domain.types';

export function useCompra(id: number | undefined) {
  return useQuery<Compra>({
    queryKey: queryKeys.compras.detail(id!),
    queryFn: () => comprasService.getById(id!).then((r) => r.data),
    enabled: !!id,
  });
}
