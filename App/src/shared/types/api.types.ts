export interface ApiResponse<T> {
  success: boolean;
  data: T;
  mensaje: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    codigo: string;
    mensaje: string;
    detalle?: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
