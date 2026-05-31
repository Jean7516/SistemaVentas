import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Caja, MovimientoCaja, TurnoCaja } from '@/shared/types/domain.types';
import type { AbrirTurnoRequest, CerrarTurnoRequest, RegistrarMovimientoRequest, TurnoQueryParams } from '../types/caja.types';

export const cajaService = {
  getCajas: () =>
    api.get<Caja[], ApiResponse<Caja[]>>('/cajas'),

  getTurnos: (params?: TurnoQueryParams) =>
    api.get<TurnoCaja, ApiResponse<PaginatedResponse<TurnoCaja>>>('/turnos', { params }),

  getTurnoActivo: () =>
    api.get<TurnoCaja | null, ApiResponse<TurnoCaja | null>>('/turnos/activo'),

  abrirTurno: (data: AbrirTurnoRequest) =>
    api.post<TurnoCaja, ApiResponse<TurnoCaja>>('/turnos', data),

  cerrarTurno: (id: number, data: CerrarTurnoRequest) =>
    api.put<TurnoCaja, ApiResponse<TurnoCaja>>(`/turnos/${id}/cierre`, data),

  getMovimientos: (turnoId: number) =>
    api.get<MovimientoCaja[], ApiResponse<MovimientoCaja[]>>(`/turnos/${turnoId}/movimientos`),

  registrarMovimiento: (turnoId: number, data: RegistrarMovimientoRequest) =>
    api.post<MovimientoCaja, ApiResponse<MovimientoCaja>>(`/turnos/${turnoId}/movimientos`, data),
};
