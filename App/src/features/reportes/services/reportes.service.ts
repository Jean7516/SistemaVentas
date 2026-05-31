import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ResumenTurno } from '../types/reportes.types';

export const reportesService = {
  getResumenTurno: (id: number) =>
    api.get<ResumenTurno, ApiResponse<ResumenTurno>>(`/reportes/turno/${id}`),

  getResumenTurnos: () =>
    api.get<ResumenTurno[], ApiResponse<ResumenTurno[]>>('/reportes/turnos'),
};
