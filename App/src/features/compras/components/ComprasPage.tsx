import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from '@tanstack/react-table';
import { Plus, MoreHorizontal, CheckCircle } from 'lucide-react';
import { useCompras } from '../hooks/useCompras';
import { useCompraMutations } from '../hooks/useCompraMutations';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/shared/components/ui/dropdown-menu';
import { formatearSoles } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import type { Compra, EstadoCompra } from '@/shared/types/domain.types';

const ch = createColumnHelper<Compra>();

const estadoBadge: Record<EstadoCompra, { variant: 'success' | 'warning' | 'destructive'; label: string }> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  recibida: { variant: 'success', label: 'Recibida' },
  anulada: { variant: 'destructive', label: 'Anulada' },
};

export function ComprasPage() {
  const navigate = useNavigate();
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;
  const params = { page, size, estado: estadoFiltro || undefined };
  const { data, isLoading } = useCompras(params);
  const { recibir } = useCompraMutations();

  const columns = useMemo(() => [
    ch.accessor('idCompra', { header: '#' }),
    ch.accessor((r) => r.proveedor.razonSocial, { id: 'proveedor', header: 'Proveedor' }),
    ch.accessor('fechaHora', {
      header: 'Fecha',
      cell: (i) => new Date(i.getValue()).toLocaleDateString('es-PE'),
    }),
    ch.accessor('estado', {
      header: 'Estado',
      cell: (i) => {
        const cfg = estadoBadge[i.getValue()];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    }),
    ch.accessor('total', {
      header: 'Total',
      cell: (i) => formatearSoles(i.getValue()),
    }),
    ch.display({
      id: 'acciones',
      cell: (i) => {
        const compra = i.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
            <DropdownMenuContent>
              {compra.estado === 'pendiente' && (
                <DropdownMenuItem onClick={() => recibir.mutate(compra.idCompra)}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Recibir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ], [recibir]);

  const table = useReactTable({ data: data?.content ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="Órdenes de Compra" description="Gestión de órdenes de compra a proveedores"
      actions={<Button onClick={() => navigate(ROUTES.COMPRA_NUEVA)}><Plus className="h-4 w-4 mr-2" /> Nueva Compra</Button>}
    >
      <div className="flex items-center gap-4">
        <Select value={estadoFiltro} onChange={(e) => { setEstadoFiltro(e.target.value); setPage(0); }} className="w-48">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="recibida">Recibida</option>
          <option value="anulada">Anulada</option>
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
          <EmptyState title="Sin órdenes de compra" description="No se encontraron órdenes de compra con los filtros seleccionados." />
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
