import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { usuariosService } from '../services/usuarios.service';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Usuario } from '@/shared/types/domain.types';

interface UseUsuariosParams {
  page?: number;
  size?: number;
  search?: string;
}

export function useUsuarios(params: UseUsuariosParams = {}) {
  return useQuery<PaginatedResponse<Usuario>>({
    queryKey: queryKeys.usuarios.list(params),
    queryFn: () => usuariosService.getAll(params).then((r) => r.data),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}
