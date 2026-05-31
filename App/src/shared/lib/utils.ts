import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatearSoles = (monto: number): string =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(monto);

export const formatearCantidad = (cantidad: number, esFraccionable: boolean): string =>
  esFraccionable ? cantidad.toFixed(3) : cantidad.toFixed(0);
