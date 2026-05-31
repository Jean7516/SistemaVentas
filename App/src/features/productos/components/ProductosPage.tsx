import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from '@tanstack/react-table';
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { queryKeys } from '@/shared/constants/queryKeys';
import { useProductos } from '../hooks/useProductos';
import { useProductoMutations } from '../hooks/useProductoMutations';
import { productosService } from '../services/productos.service';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/shared/components/ui/dropdown-menu';
import { formatearSoles } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import type { Producto } from '@/shared/types/domain.types';

const ch = createColumnHelper<Producto>();

export function ProductosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;
  const debouncedSearch = useDebounce(search, 400);
  const params = { page, size, search: debouncedSearch || undefined, categoria: categoriaFiltro ? Number(categoriaFiltro) : undefined };
  const { data, isLoading } = useProductos(params);
  const { remove } = useProductoMutations();
  const { data: categorias } = useQuery({
    queryKey: queryKeys.categorias.all,
    queryFn: () => productosService.getCategorias().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const columns = useMemo(() => [
    ch.accessor('codigoBarras', { header: 'Código' }),
    ch.accessor('nombre', { header: 'Nombre' }),
    ch.accessor((r) => r.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    ch.accessor('precioVenta', { header: 'Precio Venta', cell: (i) => formatearSoles(i.getValue()) }),
    ch.accessor('stockActual', {
      header: 'Stock',
      cell: (i) => {
        const bajo = i.row.original.stockActual < i.row.original.stockMinimo;
        return <Badge variant={bajo ? 'destructive' : 'success'}>{i.row.original.stockActual}</Badge>;
      },
    }),
    ch.display({
      id: 'acciones',
      cell: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate(ROUTES.PRODUCTO_EDITAR(i.row.original.idProducto))}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { if (window.confirm(`¿Eliminar "${i.row.original.nombre}"?`)) remove.mutate(i.row.original.idProducto); }}>
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ], [navigate, remove]);

  const table = useReactTable({ data: data?.content ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="Productos" description="Gestión de productos del inventario"
      actions={<Button onClick={() => navigate(ROUTES.PRODUCTO_NUEVO)}><Plus className="h-4 w-4 mr-2" /> Nuevo Producto</Button>}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o código..." className="pl-9" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={categoriaFiltro} onChange={(e) => { setCategoriaFiltro(e.target.value); setPage(0); }} className="w-48">
          <option value="">Todas las categorías</option>
          {categorias?.map((cat) => <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>)}
        </Select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>{hg.headers.map((h) => (
                <th key={h.id} className="p-3 text-left text-sm font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}</tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">{row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}</tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <LoadingSpinner className="py-16" /> : !data?.content?.length ? (
          <EmptyState title="Sin productos" description="No se encontraron productos con los filtros seleccionados." />
        ) : null}
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Página {data.number + 1} de {data.totalPages} ({data.totalElements} registros)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
