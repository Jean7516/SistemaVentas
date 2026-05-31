import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { cajaService } from '../services/caja.service';
import type { MovimientoCaja } from '@/shared/types/domain.types';

export function useMovimientos(turnoId: number | undefined) {
  return useQuery<MovimientoCaja[]>({
    queryKey: queryKeys.caja.movimientos(turnoId ?? 0),
    queryFn: () => cajaService.getMovimientos(turnoId!).then((r) => r.data),
    enabled: !!turnoId,
  });
}
