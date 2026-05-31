import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { productosService } from '../services/productos.service';
import { ROUTES } from '@/shared/constants/routes';
import type { ApiError } from '@/shared/types/api.types';
import type { ProductoFormData } from '../schemas/producto.schema';

export function useProductoMutations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const create = useMutation({
    mutationFn: (data: ProductoFormData) => productosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
      toast.success('Producto creado exitosamente');
      navigate(ROUTES.PRODUCTOS);
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al crear el producto');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoFormData }) =>
      productosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
      toast.success('Producto actualizado exitosamente');
      navigate(ROUTES.PRODUCTOS);
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al actualizar el producto');
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => productosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al eliminar el producto');
    },
  });

  return { create, update, remove };
}
