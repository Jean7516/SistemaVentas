export type Rol = 'ADMIN' | 'CAJERO' | 'ALMACENERO' | 'SUPERVISOR';

export type MetodoPago =
  | 'efectivo'
  | 'tarjeta_credito'
  | 'tarjeta_debito'
  | 'transferencia'
  | 'qr'
  | 'yape'
  | 'plin'
  | 'otro';

export type EstadoVenta = 'completada' | 'anulada' | 'pendiente';
export type EstadoCompra = 'pendiente' | 'recibida' | 'anulada';
export type EstadoTurno = 'abierto' | 'cerrado';
export type TipoMovimiento = 'ingreso' | 'egreso' | 'ajuste';
export type AccionAuditoria = 'INSERT' | 'UPDATE' | 'DELETE';

export interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  username: string;
  rol: Rol;
  activo: boolean;
}

export interface UnidadMedida {
  idUm: number;
  codigo: string;
  nombre: string;
  esFraccionable: boolean;
}

export interface Categoria {
  idCategoria: number;
  nombre: string;
}

export interface Producto {
  idProducto: number;
  codigoBarras?: string;
  sku?: string;
  nombre: string;
  descripcion?: string;
  categoria: Categoria;
  unidadMedida: UnidadMedida;
  precioVenta: number;
  precioCosto: number;
  igvIncluido: boolean;
  stockActual: number;
  stockMinimo: number;
  ubicacion?: string;
  activo: boolean;
  creadoEn: string;
}

export interface DetalleVenta {
  idDetalle: number;
  producto: Pick<Producto, 'idProducto' | 'nombre' | 'codigoBarras'>;
  cantidad: number;
  precioHist: number;
  costoHist: number;
  descuento: number;
  subtotal: number;
}

export interface PagoVenta {
  idPago: number;
  metodoPago: MetodoPago;
  monto: number;
  referencia?: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  descuento: number;
  subtotal: number;
}

export interface Venta {
  idVenta: number;
  numeroTicket: string;
  turno: Pick<TurnoCaja, 'idTurno'>;
  usuario: Pick<Usuario, 'idUsuario' | 'nombreCompleto'>;
  fechaHora: string;
  clienteNombre?: string;
  clienteDoc?: string;
  subtotal: number;
  descuentoTotal: number;
  igv: number;
  total: number;
  estado: EstadoVenta;
  detalles: DetalleVenta[];
  pagos: PagoVenta[];
}

export interface TurnoCaja {
  idTurno: number;
  caja: { idCaja: number; nombre: string };
  usuario: Pick<Usuario, 'idUsuario' | 'nombreCompleto'>;
  apertura: string;
  cierre?: string;
  montoApertura: number;
  montoCierre?: number;
  diferencia?: number;
  estado: EstadoTurno;
}

export interface MovimientoCaja {
  idMovimiento: number;
  turno: Pick<TurnoCaja, 'idTurno'>;
  tipo: TipoMovimiento;
  monto: number;
  descripcion?: string;
  creadoEn: string;
}

export interface Compra {
  idCompra: number;
  proveedor: Proveedor;
  usuario: Pick<Usuario, 'idUsuario' | 'nombreCompleto'>;
  fechaHora: string;
  estado: EstadoCompra;
  detalle: DetalleCompra[];
  total: number;
}

export interface DetalleCompra {
  idDetalle: number;
  producto: Pick<Producto, 'idProducto' | 'nombre'>;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Proveedor {
  idProveedor: number;
  razonSocial: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface Caja {
  idCaja: number;
  nombre: string;
}
