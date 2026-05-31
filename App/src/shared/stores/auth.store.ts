import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, TurnoCaja } from '@/shared/types/domain.types';

interface AuthStore {
  token: string | null;
  usuario: Usuario | null;
  turnoActivo: TurnoCaja | null;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setTurnoActivo: (turno: TurnoCaja | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      turnoActivo: null,
      login: (token, usuario) => {
        console.log('[login set]', { token, usuario });
        set({ token, usuario });
      },
      logout: () => set({ token: null, usuario: null, turnoActivo: null }),
      setTurnoActivo: (turno) => set({ turnoActivo: turno }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        turnoActivo: state.turnoActivo,
      }),
    },
  ),
);
