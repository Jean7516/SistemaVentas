import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { formatearSoles, formatearCantidad } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { usePermiso } from '@/shared/hooks/usePermiso';
import { useVenta } from '../hooks/useVenta';
import { useVentaMutations } from '../hooks/useVentaMutations';
import { ArrowLeft, Ban } from 'lucide-react';
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

const metodoPagoTexto: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta crédito',
  tarjeta_debito: 'Tarjeta débito',
  transferencia: 'Transferencia',
  qr: 'QR',
  yape: 'Yape',
  plin: 'Plin',
  otro: 'Otro',
};

export function VentaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { puedeAnularVenta } = usePermiso();
  const { data: venta, isLoading } = useVenta(id ? Number(id) : undefined);
  const { anular } = useVentaMutations();

  if (isLoading) return <LoadingSpinner />;

  if (!venta) {
    return (
      <PageWrapper title="Venta no encontrada">
        <p className="text-muted-foreground">La venta solicitada no existe.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </PageWrapper>
    );
  }

  const handleAnular = () => {
    const motivo = window.prompt('Motivo de anulación:');
    if (!motivo || !motivo.trim()) return;
    anular.mutate({ id: venta.idVenta, data: { motivo: motivo.trim() } });
  };
  console.log()
  return (
    <PageWrapper
      title={`Ticket ${venta.numeroTicket}`}
      description={format(new Date(venta.fechaHora), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTES.VENTAS)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium">Cant.</th>
                    <th className="pb-2 font-medium text-right">Precio</th>
                    <th className="pb-2 font-medium text-right">Desc.</th>
                    <th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.detalles.map((d) => (
                    <tr key={d.idDetalle} className="border-b last:border-0">
                      <td className="py-2">{d.producto.nombre}</td>
                      <td className="py-2">{formatearCantidad(d.cantidad, false)}</td>
                      <td className="py-2 text-right">{formatearSoles(d.precioHist)}</td>
                      <td className="py-2 text-right">{formatearSoles(d.descuento)}</td>
                      <td className="py-2 text-right font-mono">{formatearSoles(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Método</th>
                    <th className="pb-2 font-medium text-right">Monto</th>
                    <th className="pb-2 font-medium">Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.pagos.map((p, i) => (
                    <tr key={p.idPago || i} className="border-b last:border-0">
                      <td className="py-2">{metodoPagoTexto[p.metodoPago] || p.metodoPago}</td>
                      <td className="py-2 text-right font-mono">{formatearSoles(p.monto)}</td>
                      <td className="py-2">{p.referencia || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant={badgeVariant[venta.estado] || 'outline'}>
                  {estadoTexto[venta.estado] || venta.estado}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usuario</span>
                <span>{venta.usuario.nombreCompleto}</span>
              </div>
              {venta.clienteNombre && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente</span>
                  <span>{venta.clienteNombre}</span>
                </div>
              )}
              {venta.clienteDoc && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doc.</span>
                  <span>{venta.clienteDoc}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatearSoles(venta.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span>{formatearSoles(venta.descuentoTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IGV</span>
                <span>{formatearSoles(venta.igv)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatearSoles(venta.total)}</span>
              </div>
            </CardContent>
          </Card>

          {venta.estado === 'completada' && puedeAnularVenta && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleAnular}
              disabled={anular.isPending}
            >
              <Ban className="mr-2 h-4 w-4" />
              {anular.isPending ? 'Anulando...' : 'Anular venta'}
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
