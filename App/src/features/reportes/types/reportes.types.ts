export interface ResumenTurno {
  idTurno: number;
  caja: string;
  usuario: string;
  apertura: string;
  cierre?: string;
  ventaTotal: number;
  ventaEfectivo: number;
  ventaTarjeta: number;
  ventaOtros: number;
  totalTransacciones: number;
  productosVendidos: number;
  montoApertura: number;
  montoCierre?: number;
  diferencia?: number;
}
