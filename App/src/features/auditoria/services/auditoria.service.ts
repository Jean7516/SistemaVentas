import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { AuditoriaEntry, AuditoriaParams } from '../types/auditoria.types';

export const auditoriaService = {
  getAll: (params?: AuditoriaParams) =>
    api.get<AuditoriaEntry, ApiResponse<PaginatedResponse<AuditoriaEntry>>>('/auditoria', { params }),
};
