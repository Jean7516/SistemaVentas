import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/auth.store';
import { formatearSoles } from '@/shared/lib/utils';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { useCajas } from '../hooks/useCajas';
import { useTurnoActivo } from '../hooks/useTurnoActivo';
import { useMovimientos } from '../hooks/useMovimientos';
import { useAbrirTurno, useCerrarTurno, useRegistrarMovimiento } from '../hooks/useCajaMutations';

const abrirTurnoSchema = z.object({
  idCaja: z.string().min(1, 'Selecciona una caja'),
  montoApertura: z.string().min(1, 'El monto es requerido'),
});

const cerrarTurnoSchema = z.object({
  montoCierre: z.string().min(1, 'El monto es requerido'),
});

const movimientoSchema = z.object({
  tipo: z.enum(['ingreso', 'egreso', 'ajuste']),
  monto: z.string().min(1, 'El monto es requerido'),
  descripcion: z.string().optional(),
});

type AbrirTurnoFormValues = z.infer<typeof abrirTurnoSchema>;
type CerrarTurnoFormValues = z.infer<typeof cerrarTurnoSchema>;
type MovimientoFormValues = z.infer<typeof movimientoSchema>;

function AbrirTurnoForm() {
  const { data: cajas, isLoading: cajasLoading } = useCajas();
  const abrirTurno = useAbrirTurno();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AbrirTurnoFormValues>({
    resolver: zodResolver(abrirTurnoSchema),
  });

  const onSubmit = (data: AbrirTurnoFormValues) => {
    abrirTurno.mutate({
      idCaja: Number(data.idCaja),
      montoApertura: Number(data.montoApertura),
    });
  };

  if (cajasLoading) return <LoadingSpinner />;

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Abrir Turno</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idCaja">Caja</Label>
            <Select id="idCaja" {...register('idCaja')}>
              <option value="">Seleccionar caja</option>
              {cajas?.map((caja) => (
                <option key={caja.idCaja} value={caja.idCaja}>
                  {caja.nombre}
                </option>
              ))}
            </Select>
            {errors.idCaja && (
              <p className="text-sm text-destructive">{errors.idCaja.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="montoApertura">Monto de apertura (S/)</Label>
            <Input
              id="montoApertura"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('montoApertura')}
            />
            {errors.montoApertura && (
              <p className="text-sm text-destructive">{errors.montoApertura.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={abrirTurno.isPending}>
            {abrirTurno.isPending ? 'Abriendo turno...' : 'Abrir Turno'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CerrarTurnoForm({ turnoId }: { turnoId: number }) {
  const [showForm, setShowForm] = useState(false);
  const cerrarTurno = useCerrarTurno();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CerrarTurnoFormValues>({
    resolver: zodResolver(cerrarTurnoSchema),
  });

  const onSubmit = (data: CerrarTurnoFormValues) => {
    cerrarTurno.mutate({
      id: turnoId,
      data: { montoCierre: Number(data.montoCierre) },
    });
  };

  if (!showForm) {
    return (
      <Button variant="destructive" onClick={() => setShowForm(true)}>
        Cerrar Turno
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="montoCierre">Monto de cierre (S/)</Label>
          <Input
            id="montoCierre"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('montoCierre')}
          />
          {errors.montoCierre && (
            <p className="text-sm text-destructive">{errors.montoCierre.message}</p>
          )}
        </div>
        <Button type="submit" variant="destructive" disabled={cerrarTurno.isPending}>
          {cerrarTurno.isPending ? 'Cerrando...' : 'Confirmar Cierre'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </form>
    </div>
  );
}

function RegistrarMovimientoForm({ turnoId }: { turnoId: number }) {
  const [showForm, setShowForm] = useState(false);
  const registrarMovimiento = useRegistrarMovimiento();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
  });

  const onSubmit = (data: MovimientoFormValues) => {
    registrarMovimiento.mutate(
      {
        turnoId,
        data: {
          tipo: data.tipo,
          monto: Number(data.monto),
          descripcion: data.descripcion,
        },
      },
      { onSuccess: () => { reset(); setShowForm(false); } },
    );
  };

  if (!showForm) {
    return (
      <Button variant="outline" onClick={() => setShowForm(true)}>
        Registrar Movimiento
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nuevo Movimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select id="tipo" {...register('tipo')}>
              <option value="">Seleccionar tipo</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
              <option value="ajuste">Ajuste</option>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto (S/)</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('monto')}
            />
            {errors.monto && (
              <p className="text-sm text-destructive">{errors.monto.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              type="text"
              placeholder="Descripción del movimiento"
              {...register('descripcion')}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={registrarMovimiento.isPending}>
              {registrarMovimiento.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { reset(); setShowForm(false); }}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TurnoInfo() {
  const turnoActivo = useAuthStore((s) => s.turnoActivo);
  const { data: movimientos, isLoading: movimientosLoading } = useMovimientos(turnoActivo?.idTurno);

  if (!turnoActivo) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Turno Activo</CardTitle>
            <Badge variant="success">Abierto</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Caja</dt>
              <dd className="font-medium">{turnoActivo.caja.nombre}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Usuario</dt>
              <dd className="font-medium">{turnoActivo.usuario.nombreCompleto}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Apertura</dt>
              <dd className="font-medium">
                {new Date(turnoActivo.apertura).toLocaleString('es-PE')}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Monto apertura</dt>
              <dd className="font-medium">{formatearSoles(turnoActivo.montoApertura)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <CerrarTurnoForm turnoId={turnoActivo.idTurno} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Movimientos</h2>
          <RegistrarMovimientoForm turnoId={turnoActivo.idTurno} />
        </div>

        {movimientosLoading ? (
          <LoadingSpinner />
        ) : !movimientos?.length ? (
          <p className="text-sm text-muted-foreground">No hay movimientos registrados</p>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Tipo</th>
                  <th className="px-4 py-2 text-right font-medium">Monto</th>
                  <th className="px-4 py-2 text-left font-medium">Descripción</th>
                  <th className="px-4 py-2 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.idMovimiento} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          mov.tipo === 'ingreso'
                            ? 'success'
                            : mov.tipo === 'egreso'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {mov.tipo === 'ingreso'
                          ? 'Ingreso'
                          : mov.tipo === 'egreso'
                            ? 'Egreso'
                            : 'Ajuste'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatearSoles(mov.monto)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {mov.descripcion ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(mov.creadoEn).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function CajaPage() {
  const turnoActivo = useAuthStore((s) => s.turnoActivo);
  const { isLoading } = useTurnoActivo();

  if (isLoading) {
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Gestión de Caja"
      description={turnoActivo ? 'Turno activo — administra los movimientos y cierre' : 'Abre un turno para comenzar a operar'}
    >
      {turnoActivo ? <TurnoInfo /> : <AbrirTurnoForm />}
    </PageWrapper>
  );
}
