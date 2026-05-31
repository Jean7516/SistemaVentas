import type { AccionAuditoria } from '@/shared/types/domain.types';

export interface AuditoriaEntry {
  idAuditoria: number;
  tablaAfectada: string;
  pkRegistro: number;
  accion: AccionAuditoria;
  usuario: { idUsuario: number; username: string };
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
  creadoEn: string;
}

export interface AuditoriaParams {
  tabla?: string;
  page?: number;
  size?: number;
}
