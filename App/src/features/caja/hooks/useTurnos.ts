import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { cajaService } from '../services/caja.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { TurnoCaja } from '@/shared/types/domain.types';
import type { TurnoQueryParams } from '../types/caja.types';

export function useTurnos(params?: TurnoQueryParams) {
  return useQuery<PaginatedResponse<TurnoCaja>>({
    queryKey: queryKeys.caja.turnos(params),
    queryFn: () => cajaService.getTurnos(params).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}
