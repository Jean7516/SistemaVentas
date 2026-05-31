import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { comprasService } from '../services/compras.service';
import { ROUTES } from '@/shared/constants/routes';
import type { ApiError } from '@/shared/types/api.types';
import type { CrearCompraRequest } from '../types/compra.types';

export function useCompraMutations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const create = useMutation({
    mutationFn: (data: CrearCompraRequest) => comprasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compras.all });
      toast.success('Orden de compra creada exitosamente');
      navigate(ROUTES.COMPRAS);
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al crear la orden de compra');
    },
  });

  const recibir = useMutation({
    mutationFn: (id: number) => comprasService.recibir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compras.all });
      toast.success('Compra recibida exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al recibir la compra');
    },
  });

  return { create, recibir };
}
