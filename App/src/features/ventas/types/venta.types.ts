import type { MetodoPago } from '@/shared/types/domain.types';

export interface CrearVentaRequest {
  idTurno: number;
  clienteNombre?: string;
  clienteDoc?: string;
  items: Array<{
    idProducto: number;
    cantidad: number;
    descuento: number;
  }>;
  pagos: Array<{
    metodoPago: MetodoPago;
    monto: number;
    referencia?: string;
  }>;
}

export interface AnularVentaRequest {
  motivo: string;
}
