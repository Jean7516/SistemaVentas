import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse, ApiResponse<LoginResponse>>('/auth/login', data),
};
