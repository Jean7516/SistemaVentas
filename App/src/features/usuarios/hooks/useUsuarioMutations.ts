import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { usuariosService } from '../services/usuarios.service';
import type { ApiError } from '@/shared/types/api.types';
import type { CrearUsuarioRequest, ActualizarUsuarioRequest } from '../types/usuarios.types';

export function useUsuarioMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all });

  const create = useMutation({
    mutationFn: (data: CrearUsuarioRequest) => usuariosService.create(data),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al crear el usuario');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarUsuarioRequest }) =>
      usuariosService.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al actualizar el usuario');
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => usuariosService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al eliminar el usuario');
    },
  });

  return { create, update, remove };
}
