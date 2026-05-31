import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { useUsuarioMutations } from '../hooks/useUsuarioMutations';
import type { Usuario } from '@/shared/types/domain.types';

const ROLES = ['ADMIN', 'CAJERO', 'ALMACENERO', 'SUPERVISOR'] as const;

const usuarioSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es obligatorio'),
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().optional().or(z.literal('')),
  rol: z.enum(ROLES),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UsuarioFormModalProps {
  open: boolean;
  onClose: () => void;
  usuario?: Usuario | null;
}

export function UsuarioFormModal({ open, onClose, usuario }: UsuarioFormModalProps) {
  const { create, update } = useUsuarioMutations();
  const isEditing = !!usuario;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombreCompleto: '',
      username: '',
      password: '',
      rol: 'CAJERO',
    },
  });

  useEffect(() => {
    if (usuario) {
      reset({
        nombreCompleto: usuario.nombreCompleto,
        username: usuario.username,
        password: '',
        rol: usuario.rol,
      });
    } else {
      reset({ nombreCompleto: '', username: '', password: '', rol: 'CAJERO' });
    }
  }, [usuario, reset, open]);

  if (!open) return null;

  const onSubmit = (formData: UsuarioFormData) => {
    if (isEditing) {
      const payload: import('../types/usuarios.types').ActualizarUsuarioRequest = {
        nombreCompleto: formData.nombreCompleto,
        rol: formData.rol,
        password: formData.password || undefined,
      };
      update.mutate(
        { id: usuario!.idUsuario, data: payload },
        { onSuccess: () => onClose() },
      );
    } else {
      create.mutate(
        { nombreCompleto: formData.nombreCompleto, username: formData.username, password: formData.password!, rol: formData.rol },
        { onSuccess: () => onClose() },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre completo</label>
            <Input {...register('nombreCompleto')} />
            {errors.nombreCompleto && (
              <p className="text-sm text-destructive">{errors.nombreCompleto.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Usuario</label>
            <Input {...register('username')} disabled={isEditing} />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contraseña{isEditing ? ' (dejar vacío para mantener)' : ''}
            </label>
            <Input type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rol</label>
            <Select {...register('rol')}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
            {errors.rol && (
              <p className="text-sm text-destructive">{errors.rol.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
