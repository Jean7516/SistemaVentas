import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { useProducto } from '../hooks/useProducto';
import { useProductoMutations } from '../hooks/useProductoMutations';
import { productosService } from '../services/productos.service';
import { productoSchema, type ProductoFormData } from '../schemas/producto.schema';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { ROUTES } from '@/shared/constants/routes';

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ProductoFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'nuevo';
  const productoId = isEdit ? Number(id) : undefined;
  const navigate = useNavigate();
  const { create, update } = useProductoMutations();
  const { data: producto } = useProducto(productoId);
  const { data: categorias } = useQuery({
    queryKey: queryKeys.categorias.all,
    queryFn: () => productosService.getCategorias().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });
  const { data: unidades } = useQuery({
    queryKey: queryKeys.unidadesMedida.all,
    queryFn: () => productosService.getUnidadesMedida().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: { nombre: '', codigoBarras: '', sku: '', descripcion: '', idCategoria: 0, idUnidadMedida: 0, precioVenta: 0, precioCosto: 0, igvIncluido: false, stockActual: 0, stockMinimo: 0, ubicacion: '' },
  });

  useEffect(() => {
    if (!producto) return;
    reset({
      nombre: producto.nombre, codigoBarras: producto.codigoBarras ?? '', sku: producto.sku ?? '', descripcion: producto.descripcion ?? '',
      idCategoria: producto.categoria.idCategoria, idUnidadMedida: producto.unidadMedida.idUm,
      precioVenta: producto.precioVenta, precioCosto: producto.precioCosto, igvIncluido: producto.igvIncluido,
      stockActual: producto.stockActual, stockMinimo: producto.stockMinimo, ubicacion: producto.ubicacion ?? '',
    });
  }, [producto, reset]);

  const onSubmit = (data: ProductoFormData) => {
    if (isEdit && productoId) update.mutate({ id: productoId, data });
    else create.mutate(data);
  };
  const isPending = create.isPending || update.isPending;

  return (
    <PageWrapper title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      description={isEdit ? 'Modifica los datos del producto' : 'Ingresa los datos del nuevo producto'}
    >
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Nombre" id="nombre" error={errors.nombre?.message}>
              <Input id="nombre" {...register('nombre')} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Código de Barras" id="codigoBarras"><Input id="codigoBarras" {...register('codigoBarras')} /></Field>
              <Field label="SKU" id="sku"><Input id="sku" {...register('sku')} /></Field>
            </div>
            <Field label="Descripción" id="descripcion"><Input id="descripcion" {...register('descripcion')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoría" id="idCategoria" error={errors.idCategoria?.message}>
                <Select id="idCategoria" {...register('idCategoria', { valueAsNumber: true })}>
                  <option value="">Seleccionar categoría</option>
                  {categorias?.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
                </Select>
              </Field>
              <Field label="Unidad de Medida" id="idUnidadMedida" error={errors.idUnidadMedida?.message}>
                <Select id="idUnidadMedida" {...register('idUnidadMedida', { valueAsNumber: true })}>
                  <option value="">Seleccionar unidad</option>
                  {unidades?.map((u) => <option key={u.idUm} value={u.idUm}>{u.nombre} ({u.codigo})</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio de Venta (S/)" id="precioVenta" error={errors.precioVenta?.message}>
                <Input id="precioVenta" type="number" step="0.01" {...register('precioVenta', { valueAsNumber: true })} />
              </Field>
              <Field label="Precio de Costo (S/)" id="precioCosto" error={errors.precioCosto?.message}>
                <Input id="precioCosto" type="number" step="0.01" {...register('precioCosto', { valueAsNumber: true })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock Actual" id="stockActual" error={errors.stockActual?.message}>
                <Input id="stockActual" type="number" {...register('stockActual', { valueAsNumber: true })} />
              </Field>
              <Field label="Stock Mínimo" id="stockMinimo" error={errors.stockMinimo?.message}>
                <Input id="stockMinimo" type="number" {...register('stockMinimo', { valueAsNumber: true })} />
              </Field>
            </div>
            <Field label="Ubicación" id="ubicacion"><Input id="ubicacion" {...register('ubicacion')} /></Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="igvIncluido" {...register('igvIncluido')} />
              <Label htmlFor="igvIncluido">IGV incluido</Label>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PRODUCTOS)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : isEdit ? 'Actualizar Producto' : 'Crear Producto'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
