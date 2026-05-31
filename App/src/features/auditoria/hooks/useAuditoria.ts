import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditoriaService } from '../services/auditoria.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { AuditoriaEntry, AuditoriaParams } from '../types/auditoria.types';

export function useAuditoria(params: AuditoriaParams = {}) {
  const { tabla, page = 0, size = 15 } = params;

  return useQuery<PaginatedResponse<AuditoriaEntry>>({
    queryKey: ['auditoria', 'list', tabla ?? '', page, size],
    queryFn: () => auditoriaService.getAll({ tabla, page, size }).then((r) => r.data),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}
