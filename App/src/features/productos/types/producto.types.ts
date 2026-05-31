export interface ProductoFormData {
  nombre: string;
  codigoBarras?: string;
  sku?: string;
  descripcion?: string;
  idCategoria: number;
  idUnidadMedida: number;
  precioVenta: number;
  precioCosto: number;
  igvIncluido: boolean;
  stockActual: number;
  stockMinimo: number;
  ubicacion?: string;
}
