export interface CrearCompraRequest {
  idProveedor: number;
  items: Array<{
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export interface ProveedorFormData {
  razonSocial: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}
