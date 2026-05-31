import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { productosService } from '../services/productos.service';
import type { Producto } from '@/shared/types/domain.types';

export function useProducto(id: number | undefined) {
  return useQuery<Producto>({
    queryKey: queryKeys.productos.detail(id!),
    queryFn: () => productosService.getById(id!).then((r) => r.data),
    enabled: !!id,
  });
}
