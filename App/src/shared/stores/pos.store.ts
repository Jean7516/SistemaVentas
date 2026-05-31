import { create } from 'zustand';
import type { MetodoPago, ItemCarrito, Producto } from '@/shared/types/domain.types';

interface PosStore {
  items: ItemCarrito[];
  metodoPago: MetodoPago;
  agregarItem: (producto: Producto, cantidad: number) => void;
  quitarItem: (idProducto: number) => void;
  actualizarCantidad: (idProducto: number, cantidad: number) => void;
  actualizarDescuento: (idProducto: number, descuento: number) => void;
  limpiarCarrito: () => void;
  setMetodoPago: (metodo: MetodoPago) => void;
}

export const usePosStore = create<PosStore>()((set) => ({
  items: [],
  metodoPago: 'efectivo',
  agregarItem: (producto, cantidad) =>
    set((state) => {
      const existing = state.items.find((i) => i.producto.idProducto === producto.idProducto);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.producto.idProducto === producto.idProducto
              ? {
                  ...i,
                  cantidad: i.cantidad + cantidad,
                  subtotal: (i.cantidad + cantidad) * i.producto.precioVenta - i.descuento,
                }
              : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            producto,
            cantidad,
            descuento: 0,
            subtotal: cantidad * producto.precioVenta,
          },
        ],
      };
    }),
  quitarItem: (idProducto) =>
    set((state) => ({
      items: state.items.filter((i) => i.producto.idProducto !== idProducto),
    })),
  actualizarCantidad: (idProducto, cantidad) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.producto.idProducto === idProducto
          ? { ...i, cantidad, subtotal: cantidad * i.producto.precioVenta - i.descuento }
          : i,
      ),
    })),
  actualizarDescuento: (idProducto, descuento) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.producto.idProducto === idProducto
          ? { ...i, descuento, subtotal: i.cantidad * i.producto.precioVenta - descuento }
          : i,
      ),
    })),
  limpiarCarrito: () => set({ items: [], metodoPago: 'efectivo' }),
  setMetodoPago: (metodo) => set({ metodoPago: metodo }),
}));
