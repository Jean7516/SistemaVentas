import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { ventasService } from '../services/ventas.service';
import type { ApiError } from '@/shared/types/api.types';
import type { CrearVentaRequest, AnularVentaRequest } from '../types/venta.types';

export function useVentaMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: CrearVentaRequest) => ventasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventas.all });
      toast.success('Venta registrada exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al registrar la venta');
    },
  });

  const anular = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AnularVentaRequest }) =>
      ventasService.anular(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventas.all });
      toast.success('Venta anulada exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al anular la venta');
    },
  });

  return { create, anular };
}
