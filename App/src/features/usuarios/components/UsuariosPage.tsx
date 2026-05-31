import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/shared/components/ui/dropdown-menu';
import { useUsuarios } from '../hooks/useUsuarios';
import { useUsuarioMutations } from '../hooks/useUsuarioMutations';
import { UsuarioFormModal } from './UsuarioFormModal';
import type { Usuario } from '@/shared/types/domain.types';

const ch = createColumnHelper<Usuario>();

const rolBadge: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  ADMIN: 'destructive',
  SUPERVISOR: 'warning',
  CAJERO: 'success',
  ALMACENERO: 'secondary',
};

export function UsuariosPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const size = 10;

  const params = { page, size, search: search || undefined };
  const { data, isLoading } = useUsuarios(params);
  const { remove } = useUsuarioMutations();

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: Usuario) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const columns = [
    ch.accessor('nombreCompleto', { header: 'Nombre completo' }),
    ch.accessor('username', { header: 'Usuario' }),
    ch.accessor('rol', {
      header: 'Rol',
      cell: (i) => <Badge variant={rolBadge[i.getValue()] ?? 'default'}>{i.getValue()}</Badge>,
    }),
    ch.accessor('activo', {
      header: 'Activo',
      cell: (i) => <Badge variant={i.getValue() ? 'success' : 'destructive'}>{i.getValue() ? 'Sí' : 'No'}</Badge>,
    }),
    ch.display({
      id: 'acciones',
      cell: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openEdit(i.row.original)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm(`¿Eliminar al usuario "${i.row.original.nombreCompleto}"?`)) {
                  remove.mutate(i.row.original.idUsuario);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.content ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageWrapper
      title="Usuarios"
      description="Gestión de usuarios del sistema"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Usuario
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre o usuario..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="max-w-sm"
        />
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
        ) : !data?.content?.length ? (
          <EmptyState title="Sin usuarios" description="No se encontraron usuarios." />
        ) : null}
      </div>

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

      <UsuarioFormModal
        open={modalOpen}
        onClose={closeModal}
        usuario={editingUser}
      />
    </PageWrapper>
  );
}
