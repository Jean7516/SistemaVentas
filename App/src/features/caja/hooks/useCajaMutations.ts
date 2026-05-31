import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { useAuthStore } from '@/shared/stores/auth.store';
import { cajaService } from '../services/caja.service';
import type { ApiError } from '@/shared/types/api.types';
import type { AbrirTurnoRequest, CerrarTurnoRequest, RegistrarMovimientoRequest } from '../types/caja.types';

export function useAbrirTurno() {
  const queryClient = useQueryClient();
  const setTurnoActivo = useAuthStore((s) => s.setTurnoActivo);

  return useMutation({
    mutationFn: (data: AbrirTurnoRequest) => cajaService.abrirTurno(data),
    onSuccess: (response) => {
      setTurnoActivo(response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.caja.turnos() });
      toast.success('Turno abierto exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al abrir el turno');
    },
  });
}

export function useCerrarTurno() {
  const queryClient = useQueryClient();
  const setTurnoActivo = useAuthStore((s) => s.setTurnoActivo);

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CerrarTurnoRequest }) =>
      cajaService.cerrarTurno(id, data),
    onSuccess: () => {
      setTurnoActivo(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.caja.all });
      toast.success('Turno cerrado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al cerrar el turno');
    },
  });
}

export function useRegistrarMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ turnoId, data }: { turnoId: number; data: RegistrarMovimientoRequest }) =>
      cajaService.registrarMovimiento(turnoId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caja.movimientos(variables.turnoId) });
      toast.success('Movimiento registrado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al registrar el movimiento');
    },
  });
}
