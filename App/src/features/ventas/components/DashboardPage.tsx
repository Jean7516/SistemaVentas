import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInMilliseconds } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ShoppingCart, Package, DollarSign, Clock, TrendingUp,
  Plus, LogIn, FileText, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatearSoles } from '@/shared/lib/utils';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useResumenTurnos } from '@/features/reportes';
import { useProductos } from '@/features/productos';
import { useVentas } from '../hooks/useVentas';
import { ROUTES } from '@/shared/constants/routes';
import { Sparkline } from './Sparkline';

const accionVenta: Record<string, 'success' | 'warning' | 'destructive'> = {
  completada: 'success',
  pendiente: 'warning',
  anulada: 'destructive',
};

const labelEstado: Record<string, string> = {
  completada: 'Completada',
  pendiente: 'Pendiente',
  anulada: 'Anulada',
};

const CARD_COLORS = {
  ventas: '#0073e6',
  productos: '#2ecc71',
  stock: '#ef4444',
  turno: '#f59e0b',
} as const;

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-6">
      <div className="mb-3 h-4 w-28 rounded bg-muted" />
      <div className="mb-2 h-7 w-36 rounded bg-muted" />
      <div className="h-3 w-20 rounded bg-muted" />
    </div>
  );
}

function DuracionTurno({ apertura }: { apertura: string }) {
  const duracion = useMemo(() => {
    try {
      const diff = differenceInMilliseconds(new Date(), new Date(apertura));
      const horas = Math.floor(diff / 3_600_000);
      const minutos = Math.floor((diff % 3_600_000) / 60_000);
      if (horas > 0) return `${horas}h ${minutos}m`;
      return `${minutos}m`;
    } catch {
      return '';
    }
  }, [apertura]);

  return <span>{duracion}</span>;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const turno = useAuthStore((s) => s.turnoActivo);

  const { data: turnos, isLoading: turnosLoading } = useResumenTurnos();
  const { data: prodCount } = useProductos({ size: 1 });
  const { data: allProds, isLoading: prodsLoading } = useProductos({ size: 9999 });
  const { data: ventasPage, isLoading: ventasLoading } = useVentas({ size: 5, sort: 'idVenta,desc' });

  const ultimasVentas = ventasPage?.content ?? [];
  const tieneTurnosConVentas = (turnos?.length ?? 0) > 0 && turnos!.some((t) => (t.ventaTotal ?? 0) > 0);
  const tieneVentas = ultimasVentas.length > 0;

  const totalVentas = useMemo(
    () => turnos?.reduce((sum, t) => sum + (t.ventaTotal ?? 0), 0) ?? 0,
    [turnos],
  );
  const totalProductosVendidos = useMemo(
    () => turnos?.reduce((sum, t) => sum + (t.productosVendidos ?? 0), 0) ?? 0,
    [turnos],
  );
  const totalTransacciones = useMemo(
    () => turnos?.reduce((sum, t) => sum + (t.totalTransacciones ?? 0), 0) ?? 0,
    [turnos],
  );
  const ventasDesdeUltimas = useMemo(
    () => ultimasVentas.reduce((sum, v) => sum + (v.total ?? 0), 0),
    [ultimasVentas],
  );
  const productosDesdeUltimas = useMemo(
    () => ultimasVentas.reduce((sum, v) => sum + v.detalles.reduce((s, d) => s + (d.cantidad ?? 0), 0), 0),
    [ultimasVentas],
  );

  const stockBajo = useMemo(
    () => allProds?.content?.filter((p) => p.stockActual < p.stockMinimo).length ?? 0,
    [allProds],
  );
  const totalProductos = prodCount?.totalElements ?? 0;

  const valorVentas = tieneTurnosConVentas ? totalVentas : ventasDesdeUltimas;
  const valorProductos = tieneTurnosConVentas ? totalProductosVendidos : productosDesdeUltimas;
  const valorTransacciones = tieneTurnosConVentas ? totalTransacciones : ultimasVentas.length;

  const sparklineData = useMemo(() => {
    const base = valorVentas || 100;
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Hoy'];
    return labels.map((day, i) => ({
      day,
      valor: Math.round(base * (0.25 + 0.75 * (i / (labels.length - 1)))),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tieneTurnosConVentas, totalVentas, ventasDesdeUltimas]);

  const isLoading = turnosLoading || prodsLoading;

  if (isLoading && !turnos && !allProds) {
    return (
      <PageWrapper title="Dashboard" description="Resumen del día">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Dashboard"
      description={
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span>📍</span>
          {turno ? (
            <>
              {turno.caja.nombre}
              <span className="text-muted-foreground/50">•</span>
              Abierto hace <DuracionTurno apertura={turno.apertura} />
              <span className="text-muted-foreground/50">•</span>
              {turno.usuario.nombreCompleto}
            </>
          ) : (
            'Sin turno activo — abre un turno para comenzar'
          )}
        </span>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-default border-l-4 transition-shadow hover:shadow-md"
          style={{ borderLeftColor: CARD_COLORS.ventas }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {tieneTurnosConVentas ? 'Ventas hoy' : 'Ventas'}
            </CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: CARD_COLORS.ventas }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatearSoles(valorVentas)}</div>
            <p className="mb-1 text-xs text-muted-foreground">
              {tieneTurnosConVentas
                ? `${totalTransacciones} transaccion${totalTransacciones !== 1 ? 'es' : ''}`
                : tieneVentas
                  ? `Últimas ${ultimasVentas.length} ventas`
                  : 'Sin ventas registradas'}
            </p>
            {valorVentas > 0 && (
              <Sparkline data={sparklineData} color={CARD_COLORS.ventas} />
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-default border-l-4 transition-shadow hover:shadow-md"
          style={{ borderLeftColor: CARD_COLORS.productos }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos vendidos</CardTitle>
            <ShoppingCart className="h-4 w-4" style={{ color: CARD_COLORS.productos }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valorProductos}</div>
            <p className="text-xs text-muted-foreground">
              {valorTransacciones > 0
                ? `en ${valorTransacciones} transaccion${valorTransacciones !== 1 ? 'es' : ''}`
                : 'Sin ventas registradas'}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer border-l-4 transition-shadow hover:shadow-md ${
            stockBajo > 0 ? 'ring-1 ring-red-200' : ''
          }`}
          style={{ borderLeftColor: CARD_COLORS.stock }}
          onClick={() => navigate(ROUTES.PRODUCTOS)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              Stock bajo
              {stockBajo > 0 && (
                <Badge variant="destructive" className="px-1.5 py-0 text-[10px] animate-pulse">
                  {stockBajo}
                </Badge>
              )}
            </CardTitle>
            <Package className="h-4 w-4" style={{ color: CARD_COLORS.stock }} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stockBajo}</div>
              {stockBajo > 0 && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              de {totalProductos} producto{totalProductos !== 1 ? 's' : ''} registrado{totalProductos !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-default border-l-4 transition-shadow hover:shadow-md"
          style={{ borderLeftColor: CARD_COLORS.turno }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Turno activo</CardTitle>
            <Clock className="h-4 w-4" style={{ color: CARD_COLORS.turno }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {turno ? turno.caja.nombre : 'Sin turno'}
            </div>
            <p className="text-xs text-muted-foreground">
              {turno ? (
                <>
                  Abierto por {turno.usuario.nombreCompleto}
                  <span className="mx-1 text-muted-foreground/50">•</span>
                  <DuracionTurno apertura={turno.apertura} />
                </>
              ) : (
                'Abre un turno para operar'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => navigate(ROUTES.POS)}>
          <Plus className="mr-1.5 h-4 w-4" /> Nueva Venta
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.CAJA)}>
          <LogIn className="mr-1.5 h-4 w-4" /> {turno ? 'Caja' : 'Abrir Turno'}
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.PRODUCTO_NUEVO)}>
          <Package className="mr-1.5 h-4 w-4" /> Nuevo Producto
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.REPORTES)}>
          <FileText className="mr-1.5 h-4 w-4" /> Reportes
        </Button>
      </div>

      {/* Last Sales Table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimas ventas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {ventasLoading && !ultimasVentas.length ? (
            <LoadingSpinner className="py-8" />
          ) : !ultimasVentas.length ? (
            <EmptyState
              title="Sin ventas"
              description="No hay ventas registradas aún."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Ticket</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Fecha</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Cliente</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Total</th>
                    <th className="pb-2 font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVentas.map((venta) => (
                    <tr
                      key={venta.idVenta}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/30 even:bg-muted/10 last:border-0"
                      onClick={() => navigate(ROUTES.VENTA_DETALLE(venta.idVenta))}
                    >
                      <td className="py-2.5 pr-4 font-medium text-primary">
                        {venta.numeroTicket}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {(() => {
                          try {
                            return format(new Date(venta.fechaHora), 'dd/MM HH:mm', { locale: es });
                          } catch {
                            return venta.fechaHora;
                          }
                        })()}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {venta.clienteNombre ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4 font-medium">{formatearSoles(venta.total)}</td>
                      <td className="py-2.5">
                        <Badge variant={accionVenta[venta.estado] ?? 'default'}>
                          {labelEstado[venta.estado] ?? venta.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ultimasVentas.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.VENTAS)}>
                Ver todas las ventas <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
