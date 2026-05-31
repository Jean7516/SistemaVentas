import type { TipoMovimiento } from '@/shared/types/domain.types';

export interface AbrirTurnoRequest {
  idCaja: number;
  montoApertura: number;
}

export interface CerrarTurnoRequest {
  montoCierre: number;
}

export interface RegistrarMovimientoRequest {
  tipo: TipoMovimiento;
  monto: number;
  descripcion?: string;
}

export interface TurnoQueryParams {
  page?: number;
  size?: number;
}
