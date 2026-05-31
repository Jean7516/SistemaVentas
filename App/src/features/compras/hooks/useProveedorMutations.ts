import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { comprasService } from '../services/compras.service';
import type { ApiError } from '@/shared/types/api.types';
import type { ProveedorFormData } from '../types/compra.types';

export function useProveedorMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: ProveedorFormData) => comprasService.createProveedor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proveedores.all });
      toast.success('Proveedor creado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al crear el proveedor');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProveedorFormData }) =>
      comprasService.updateProveedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proveedores.all });
      toast.success('Proveedor actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al actualizar el proveedor');
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => comprasService.deleteProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proveedores.all });
      toast.success('Proveedor eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al eliminar el proveedor');
    },
  });

  return { create, update, remove };
}
