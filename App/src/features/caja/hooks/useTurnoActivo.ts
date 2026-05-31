import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { cajaService } from '../services/caja.service';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { TurnoCaja } from '@/shared/types/domain.types';

export function useTurnoActivo() {
  const setTurnoActivo = useAuthStore((s) => s.setTurnoActivo);

  return useQuery<TurnoCaja | null>({
    queryKey: queryKeys.caja.turnoDetail(0),
    queryFn: async () => {
      const response = await cajaService.getTurnoActivo();
      const data = response.data;
      setTurnoActivo(data);
      return data;
    },
  });
}
