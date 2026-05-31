import { z } from 'zod';

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  codigoBarras: z.string().optional().or(z.literal('')),
  sku: z.string().optional().or(z.literal('')),
  descripcion: z.string().optional().or(z.literal('')),
  idCategoria: z.coerce
    .number({ required_error: 'La categoría es obligatoria' })
    .positive('Seleccione una categoría válida'),
  idUnidadMedida: z.coerce
    .number({ required_error: 'La unidad de medida es obligatoria' })
    .positive('Seleccione una unidad de medida válida'),
  precioVenta: z.coerce
    .number({ required_error: 'El precio de venta es obligatorio' })
    .positive('El precio de venta debe ser mayor a 0'),
  precioCosto: z.coerce
    .number({ required_error: 'El precio de costo es obligatorio' })
    .positive('El precio de costo debe ser mayor a 0'),
  igvIncluido: z.boolean().default(false),
  stockActual: z.coerce.number().min(0, 'El stock no puede ser negativo').default(0),
  stockMinimo: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo').default(0),
  ubicacion: z.string().optional().or(z.literal('')),
});

export type ProductoFormData = z.infer<typeof productoSchema>;
