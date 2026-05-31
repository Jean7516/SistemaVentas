import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROUTES } from '@/shared/constants/routes';
import type { Usuario } from '@/shared/types/domain.types';
import type { ApiError } from '@/shared/types/api.types';

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const data = response.data;
      const usuario: Usuario = {
        idUsuario: data.idUsuario,
        nombreCompleto: data.username,
        username: data.username,
        rol: data.rol,
        activo: true,
      };
      login(data.token, usuario);
      toast.success(`Bienvenido, ${usuario.nombreCompleto}`);
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      toast.error(apiError.error?.mensaje || 'Error al iniciar sesión');
    },
  });
}
