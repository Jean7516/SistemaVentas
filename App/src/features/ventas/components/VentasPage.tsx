import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ROUTES } from '@/shared/constants/routes';
import { formatearSoles } from '@/shared/lib/utils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useVentas } from '../hooks/useVentas';
import { Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const badgeVariant = {
  completada: 'success' as const,
  anulada: 'destructive' as const,
  pendiente: 'warning' as const,
};

const estadoTexto: Record<string, string> = {
  completada: 'Completada',
  anulada: 'Anulada',
  pendiente: 'Pendiente',
};

export function VentasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useVentas({ search: debouncedSearch || undefined });

  return (
    <PageWrapper
      title="Historial de Ventas"
      description="Consulta y gestión de ventas realizadas"
    >
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticket o cliente..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="Sin ventas"
          description="No se encontraron ventas registradas."
        />
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Ticket</th>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-center font-medium">Estado</th>
                <th className="px-4 py-3 text-center font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((venta) => (
                <tr
                  key={venta.idVenta}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(ROUTES.VENTA_DETALLE(venta.idVenta))}
                >
                  <td className="px-4 py-3 font-medium">{venta.numeroTicket}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(venta.fechaHora), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </td>
                  <td className="px-4 py-3">{venta.clienteNombre || '—'}</td>
                  <td className="px-4 py-3">{venta.usuario.nombreCompleto}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatearSoles(venta.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={badgeVariant[venta.estado] || 'outline'}>
                      {estadoTexto[venta.estado] || venta.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTES.VENTA_DETALLE(venta.idVenta));
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
