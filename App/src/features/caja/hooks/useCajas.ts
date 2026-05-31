import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { cajaService } from '../services/caja.service';
import type { Caja } from '@/shared/types/domain.types';

export function useCajas() {
  return useQuery<Caja[]>({
    queryKey: queryKeys.caja.all,
    queryFn: () => cajaService.getCajas().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });
}
