import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { reportesService } from '../services/reportes.service';
import type { ResumenTurno } from '../types/reportes.types';

export function useResumenTurno(id: number) {
  return useQuery<ResumenTurno>({
    queryKey: queryKeys.reportes.turno(id),
    queryFn: () => reportesService.getResumenTurno(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useResumenTurnos() {
  return useQuery<ResumenTurno[]>({
    queryKey: queryKeys.reportes.turnos,
    queryFn: () => reportesService.getResumenTurnos().then((r) => r.data),
  });
}
