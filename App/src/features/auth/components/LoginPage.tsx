import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { ROUTES } from '@/shared/constants/routes';
import { useLogin } from '../hooks/useLogin';
import tiendaImg from '@/assets/img/tienda.png';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function DocjusLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="#b91c1c" strokeWidth="3" />
          <path d="M13 14h8a7 7 0 0 1 7 7v0a7 7 0 0 1-7 7h-8V14Z" fill="#b91c1c" />
          <line x1="13" y1="14" x2="13" y2="34" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-4xl font-bold tracking-tight text-red-700">Tienda</span>
      </div>
      <p className="text-base text-gray-500">Accede a su cuenta</p>
    </div>
  );
}

function PlantaIzquierda({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 160" fill="none">
      <path d="M32 160V90" stroke="#4ade80" strokeWidth="3" />
      <ellipse cx="18" cy="78" rx="14" ry="8" fill="#4ade80" opacity="0.8" />
      <ellipse cx="46" cy="68" rx="12" ry="7" fill="#22d3ee" opacity="0.7" />
      <ellipse cx="32" cy="56" rx="16" ry="9" fill="#4ade80" opacity="0.6" />
      <ellipse cx="22" cy="46" rx="10" ry="6" fill="#22d3ee" opacity="0.5" />
      <rect x="24" y="148" width="16" height="12" rx="3" fill="#9CA3AF" />
      <rect x="22" y="144" width="20" height="6" rx="2" fill="#6B7280" />
    </svg>
  );
}

function PlantaDerecha({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 140" fill="none">
      <path d="M28 140V80" stroke="#22d3ee" strokeWidth="3" />
      <ellipse cx="16" cy="68" rx="12" ry="7" fill="#22d3ee" opacity="0.7" />
      <ellipse cx="40" cy="56" rx="10" ry="6" fill="#4ade80" opacity="0.8" />
      <ellipse cx="28" cy="44" rx="14" ry="8" fill="#22d3ee" opacity="0.6" />
      <ellipse cx="18" cy="34" rx="8" ry="5" fill="#4ade80" opacity="0.5" />
      <rect x="20" y="128" width="16" height="12" rx="3" fill="#9CA3AF" />
      <rect x="18" y="124" width="20" height="6" rx="2" fill="#6B7280" />
    </svg>
  );
}

export function LoginPage() {
  const token = useAuthStore((s) => s.token);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  if (token) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#ebebef] p-4">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:flex-row md:rounded-[3rem]">
        {/* --- Left: Illustration (desktop) / Top (mobile) --- */}
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#e06460] to-[#cd3628] p-8 md:min-h-[600px] md:w-[55%] md:p-12">
          {/* Curvas decorativas de fondo */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 600 700"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C180,120 240,380 120,700 L0,700 Z"
              fill="rgba(255,255,255,0.08)"
            />
            <path
              d="M0,0 C240,180 300,480 180,700 L0,700 Z"
              fill="rgba(255,255,255,0.05)"
            />
            <circle cx="520" cy="80" r="120" fill="rgba(255,255,255,0.04)" />
            <circle cx="480" cy="620" r="160" fill="rgba(255,255,255,0.03)" />
          </svg>

          {/* Plantas decorativas */}
          <PlantaIzquierda className="pointer-events-none absolute bottom-0 left-2 h-28 w-14 md:left-4 md:h-40 md:w-20" />
          <PlantaDerecha className="pointer-events-none absolute bottom-0 right-2 h-24 w-12 md:right-4 md:h-36 md:w-18" />

          {/* Imagen central */}
          <img
            src={tiendaImg}
            alt="Tienda"
            className="relative z-10 h-auto w-full max-w-[280px] object-contain drop-shadow-lg md:max-w-[400px]"
          />
        </div>

        {/* --- Right: Login Form --- */}
        <div className="flex flex-col justify-center px-6 py-8 md:w-[45%] md:px-12 md:py-12">
          <DocjusLogo />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 md:mt-10">
            {/* Username */}
            <div>
              <div className="flex items-center border-b border-gray-300 transition-colors focus-within:border-[#0073e6]">
                <User className="mr-3 h-6 w-6 shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full border-none bg-transparent py-2.5 text-base text-gray-800 outline-none placeholder:text-gray-400"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center border-b border-gray-300 transition-colors focus-within:border-[#0073e6]">
                <Lock className="mr-3 h-6 w-6 shrink-0 text-gray-400" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="w-full border-none bg-transparent py-2.5 text-base text-gray-700 outline-none placeholder:text-gray-400"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#db5952] py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60 md:py-4"
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full ">
                  <ArrowRight className="h-4 w-4 text-white" />
                </span>
              )}
              {loginMutation.isPending ? 'INGRESANDO...' : 'INGRESAR'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
