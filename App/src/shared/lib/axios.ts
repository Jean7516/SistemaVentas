import axios from 'axios';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { ApiError } from '@/shared/types/api.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const res = error.response;
    let apiError: ApiError;

    if (res?.data && typeof res.data === 'object' && 'error' in res.data) {
      apiError = res.data as ApiError;
    } else {
      const cuerpo = typeof res?.data === 'string' ? res.data.slice(0, 200) : JSON.stringify(res?.data ?? '');
      apiError = {
        success: false,
        error: {
          codigo: String(res?.status ?? 500),
          mensaje: `Error del servidor (${res?.status ?? 500})`,
          detalle: cuerpo,
        },
        timestamp: new Date().toISOString(),
      };
    }

    console.error(`[API Error ${res?.status}]`, res?.config?.url, apiError);
    return Promise.reject(apiError);
  },
);

export { api };
