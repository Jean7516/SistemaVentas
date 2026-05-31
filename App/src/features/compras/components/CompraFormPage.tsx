import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Search } from 'lucide-react';
import { useCompraMutations } from '../hooks/useCompraMutations';
import { comprasService } from '../services/compras.service';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { formatearSoles } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import type { Proveedor, Producto } from '@/shared/types/domain.types';

interface ItemRow {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export function CompraFormPage() {
  const navigate = useNavigate();
  const [idProveedor, setIdProveedor] = useState<number>(0);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const { create } = useCompraMutations();

  const { data: proveedoresData } = useQuery({
    queryKey: ['proveedores', 'list', { size: 200 }],
    queryFn: () => comprasService.getAllProveedores({ size: 200 }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: productosData } = useQuery({
    queryKey: ['productos', 'search', debouncedSearch],
    queryFn: () => comprasService.buscarProductos(debouncedSearch).then((r) => r.data),
    enabled: debouncedSearch.length > 0,
    staleTime: 30 * 1000,
  });

  const proveedores: Proveedor[] = proveedoresData?.content ?? [];
  const productos: Producto[] = productosData?.content ?? [];

  const agregarItem = (producto: Producto) => {
    if (items.some((i) => i.producto.idProducto === producto.idProducto)) return;
    setItems([...items, { producto, cantidad: 1, precioUnitario: producto.precioCosto }]);
    setSearchTerm('');
  };

  const quitarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const actualizarItem = (index: number, campo: 'cantidad' | 'precioUnitario', valor: number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  };

  const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

  const handleSubmit = () => {
    if (!idProveedor || items.length === 0) return;
    create.mutate({
      idProveedor,
      items: items.map((i) => ({
        idProducto: i.producto.idProducto,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
      })),
    });
  };

  return (
    <PageWrapper title="Nueva Orden de Compra" description="Registra una nueva orden de compra a proveedor">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Select
                  id="proveedor"
                  value={idProveedor}
                  onChange={(e) => setIdProveedor(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar proveedor</option>
                  {proveedores.filter((p) => p.activo).map((p) => (
                    <option key={p.idProveedor} value={p.idProveedor}>
                      {p.razonSocial} - {p.ruc}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Productos</h3>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto por nombre..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && productos.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                    {productos.map((p) => (
                      <button
                        key={p.idProducto}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => agregarItem(p)}
                      >
                        <span>{p.nombre}</span>
                        <span className="text-muted-foreground">{formatearSoles(p.precioCosto)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Producto</th>
                        <th className="p-3 text-left text-sm font-medium">Cantidad</th>
                        <th className="p-3 text-left text-sm font-medium">Precio Unit.</th>
                        <th className="p-3 text-left text-sm font-medium">Subtotal</th>
                        <th className="p-3 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={item.producto.idProducto} className="border-t">
                          <td className="p-3 text-sm">{item.producto.nombre}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min={1}
                              className="w-24 h-8"
                              value={item.cantidad}
                              onChange={(e) => actualizarItem(i, 'cantidad', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              className="w-28 h-8"
                              value={item.precioUnitario}
                              onChange={(e) => actualizarItem(i, 'precioUnitario', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-3 text-sm">{formatearSoles(item.cantidad * item.precioUnitario)}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="icon" onClick={() => quitarItem(i)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className="font-medium">
                    {proveedores.find((p) => p.idProveedor === idProveedor)?.razonSocial || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatearSoles(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!idProveedor || items.length === 0 || create.isPending}
                >
                  {create.isPending ? 'Guardando...' : 'Crear Orden de Compra'}
                </Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.COMPRAS)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
