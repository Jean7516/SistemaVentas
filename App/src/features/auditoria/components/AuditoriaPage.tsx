import { useState, useMemo, useCallback, useRef } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Badge } from '@/shared/components/ui/badge';
import { Select } from '@/shared/components/ui/select';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { useAuditoria } from '../hooks/useAuditoria';
import type { AuditoriaEntry } from '../types/auditoria.types';

const TABLAS = [
  'productos',
  'ventas',
  'compras',
  'usuarios',
  'categorias',
  'proveedores',
  'caja',
  'turnos',
];

const SIZE = 15;

const accionVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'destructive',
};

const ch = createColumnHelper<AuditoriaEntry>();

function ExpandCell({
  row,
  expandedRef,
  onToggle,
}: {
  row: { original: AuditoriaEntry };
  expandedRef: React.MutableRefObject<Set<number>>;
  onToggle: (id: number) => void;
}) {
  const entry = row.original;
  const hasData = entry.datosAnteriores || entry.datosNuevos;
  if (!hasData) return null;
  const isOpen = expandedRef.current.has(entry.idAuditoria);
  return (
    <button onClick={() => onToggle(entry.idAuditoria)} className="p-1">
      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

function DetallesAuditoria({
  entries,
  expanded,
}: {
  entries: AuditoriaEntry[];
  expanded: Set<number>;
}) {
  return (
    <>
      {entries.map((entry) => {
        if (!expanded.has(entry.idAuditoria)) return null;
        return (
          <div key={`detail-${entry.idAuditoria}`} className="rounded-md border bg-muted/30 p-4 -mt-4">
            <div className="grid grid-cols-2 gap-4">
              {entry.datosAnteriores && (
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-destructive">Datos anteriores</h4>
                  <pre className="text-xs bg-background rounded p-2 overflow-auto max-h-48">
                    {JSON.stringify(entry.datosAnteriores, null, 2)}
                  </pre>
                </div>
              )}
              {entry.datosNuevos && (
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-green-600">Datos nuevos</h4>
                  <pre className="text-xs bg-background rounded p-2 overflow-auto max-h-48">
                    {JSON.stringify(entry.datosNuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function AuditoriaPage() {
  const [tabla, setTabla] = useState('');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const params = useMemo(() => ({
    ...(tabla ? { tabla } : {}),
    page,
    size: SIZE,
  }), [tabla, page]);

  const { data, isLoading, isFetching, isError, error } = useAuditoria(params);

  const toggleRow = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const tableData = useMemo(() => (data?.content ?? []).slice(0, SIZE), [data?.content]);

  const columns = useMemo(() => [
    ch.display({
      id: 'expand',
      size: 40,
      cell: (i) => (
        <ExpandCell row={i.row} expandedRef={expandedRef} onToggle={toggleRow} />
      ),
    }),
    ch.accessor('creadoEn', {
      header: 'Fecha',
      cell: (i) => {
        try {
          return format(new Date(i.getValue()), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch {
          return String(i.getValue());
        }
      },
    }),
    ch.accessor('tablaAfectada', { header: 'Tabla' }),
    ch.accessor('pkRegistro', { header: 'PK' }),
    ch.accessor('accion', {
      header: 'Acción',
      cell: (i) => (
        <Badge variant={accionVariant[i.getValue()] ?? 'default'}>
          {i.getValue()}
        </Badge>
      ),
    }),
    ch.accessor((r) => r.usuario?.username ?? '-', { id: 'usuario', header: 'Usuario' }),
  ], [toggleRow]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <PageWrapper title="Auditoría" description="Registro de cambios en el sistema">
        <EmptyState
          title="Error al cargar"
          description={(error as Error)?.message ?? 'Ocurrió un error al obtener los registros de auditoría.'}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Auditoría" description="Registro de cambios en el sistema">
      <div className="flex items-center gap-4">
        <Select
          value={tabla}
          onChange={(e) => { setTabla(e.target.value); setPage(0); }}
          className="w-56"
        >
          <option value="">Todas las tablas</option>
          {TABLAS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        {isFetching && (
          <span className="text-sm text-muted-foreground">Cargando...</span>
        )}
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="p-3 text-left text-sm font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : !tableData.length ? (
          <EmptyState title="Sin registros" description="No se encontraron registros de auditoría." />
        ) : null}
      </div>

      <DetallesAuditoria entries={tableData} expanded={expanded} />

      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.number + 1} de {data.totalPages} ({data.totalElements} registros)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
