import { useState, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useProveedores } from '../hooks/useProveedores';
import { useProveedorMutations } from '../hooks/useProveedorMutations';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import type { Proveedor } from '@/shared/types/domain.types';
import type { ProveedorFormData } from '../types/compra.types';

const ch = createColumnHelper<Proveedor>();

interface ProveedorFormState {
  abierto: boolean;
  editandoId: number | null;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
}

const formVacio = {
  abierto: false,
  editandoId: null,
  razonSocial: '',
  ruc: '',
  direccion: '',
  telefono: '',
  email: '',
};

export function ProveedoresPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const { data, isLoading } = useProveedores({ page, size });
  const { create, update, remove } = useProveedorMutations();
  const [form, setForm] = useState<ProveedorFormState>(formVacio);

  const reiniciarForm = () => setForm(formVacio);

  const abrirNuevo = () => setForm({ ...formVacio, abierto: true });

  const abrirEditar = (p: Proveedor) =>
    setForm({
      abierto: true,
      editandoId: p.idProveedor,
      razonSocial: p.razonSocial,
      ruc: p.ruc,
      direccion: p.direccion ?? '',
      telefono: p.telefono ?? '',
      email: p.email ?? '',
    });

  const handleSubmit = () => {
    const data: ProveedorFormData = {
      razonSocial: form.razonSocial,
      ruc: form.ruc,
      direccion: form.direccion || undefined,
      telefono: form.telefono || undefined,
      email: form.email || undefined,
    };

    if (form.editandoId) {
      update.mutate({ id: form.editandoId, data }, { onSuccess: reiniciarForm });
    } else {
      create.mutate(data, { onSuccess: reiniciarForm });
    }
  };

  const columns = useMemo(() => [
    ch.accessor('razonSocial', { header: 'Razón Social' }),
    ch.accessor('ruc', { header: 'RUC' }),
    ch.accessor('telefono', { header: 'Teléfono', cell: (i) => i.getValue() ?? '—' }),
    ch.accessor('email', { header: 'Email', cell: (i) => i.getValue() ?? '—' }),
    ch.accessor('activo', {
      header: 'Estado',
      cell: (i) => (
        <Badge variant={i.getValue() ? 'success' : 'destructive'}>
          {i.getValue() ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    }),
    ch.display({
      id: 'acciones',
      cell: (i) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => abrirEditar(i.row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.confirm(`¿Eliminar el proveedor "${i.row.original.razonSocial}"?`))
                remove.mutate(i.row.original.idProveedor);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }),
  ], [remove]);

  const table = useReactTable({ data: data?.content ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="Proveedores" description="Gestión de proveedores"
      actions={<Button onClick={abrirNuevo}><Plus className="h-4 w-4 mr-2" /> Nuevo Proveedor</Button>}
    >
      {form.abierto && (
        <Card className="max-w-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{form.editandoId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <Button variant="ghost" size="icon" onClick={reiniciarForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social</Label>
                <Input id="razonSocial" value={form.razonSocial}
                  onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input id="ruc" value={form.ruc}
                  onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-2">
                <Button onClick={handleSubmit} disabled={!form.razonSocial || !form.ruc || create.isPending || update.isPending}>
                  {create.isPending || update.isPending ? 'Guardando...' : <><Check className="h-4 w-4 mr-2" /> Guardar</>}
                </Button>
                <Button variant="outline" onClick={reiniciarForm}>Cancelar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <EmptyState title="Sin proveedores" description="No se encontraron proveedores registrados." />
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
