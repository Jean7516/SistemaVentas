import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart3, DollarSign, Package, Clock } from 'lucide-react';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { formatearSoles } from '@/shared/lib/utils';
import { useResumenTurnos } from '@/features/reportes';
import { useVentas } from '@/features/ventas';

export function ReportesPage() {
  const hoy = format(new Date(), "EEEE d 'de' MMMM 'del' yyyy", { locale: es });

  const { data: turnos, isLoading: loadingTurnos } = useResumenTurnos();
  const { data: ventasPage, isLoading: loadingVentas } = useVentas({ size: 5, sort: 'idVenta,desc' });

  const totalVentas = useMemo(
    () => turnos?.reduce((sum, t) => sum + (t.ventaTotal ?? 0), 0) ?? 0,
    [turnos],
  );
  const totalTransacciones = useMemo(
    () => turnos?.reduce((sum, t) => sum + (t.totalTransacciones ?? 0), 0) ?? 0,
    [turnos],
  );
  const numTurnos = turnos?.length ?? 0;

  const ultimasVentas = ventasPage?.content ?? [];
  const ventasDesdeUltimas = useMemo(
    () => ultimasVentas.reduce((sum, v) => sum + (v.total ?? 0), 0),
    [ultimasVentas],
  );

  const ventasReales = totalVentas > 0 ? totalVentas : ventasDesdeUltimas;
  const tieneDatos = totalVentas > 0 || ultimasVentas.length > 0;

  return (
    <PageWrapper
      title="Reportes"
      description={hoy.charAt(0).toUpperCase() + hoy.slice(1)}
    >
      {loadingTurnos && loadingVentas && !turnos && !ventasPage ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ventas del día</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatearSoles(ventasReales)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {tieneDatos
                  ? `${totalTransacciones || ultimasVentas.length} transaccion${(totalTransacciones || ultimasVentas.length) !== 1 ? 'es' : ''}`
                  : 'Total de ventas registradas hoy'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Productos más vendidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="mt-1 text-xs text-muted-foreground">Top productos del día</p>
              <Badge variant="outline" className="mt-3">
                Próximamente
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Turnos del día</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {numTurnos > 0 ? `${numTurnos} turno${numTurnos !== 1 ? 's' : ''}` : '0 turnos'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Resumen de turnos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gráficos de ventas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="mt-1 text-xs text-muted-foreground">Tendencia de ventas semanal</p>
              <Badge variant="outline" className="mt-3">
                Próximamente
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
