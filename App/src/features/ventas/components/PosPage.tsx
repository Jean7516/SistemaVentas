import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { usePosStore } from '@/shared/stores/pos.store';
import { ROUTES } from '@/shared/constants/routes';
import { formatearSoles, formatearCantidad } from '@/shared/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useVentaMutations } from '../hooks/useVentaMutations';
import { ventasService } from '../services/ventas.service';
import { toast } from 'sonner';
import { X, Search, DollarSign, CreditCard, Smartphone, Ban, ShoppingCart, Package } from 'lucide-react';
import type { MetodoPago, Producto } from '@/shared/types/domain.types';

interface QuantityModalProps {
  producto: Producto;
  initialCantidad: number;
  onConfirm: (cantidad: number) => void;
  onClose: () => void;
}

function QuantityModal({ producto, initialCantidad, onConfirm, onClose }: QuantityModalProps) {
  const [cantidad, setCantidad] = useState(initialCantidad > 0 ? initialCantidad : 1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleConfirm = () => {
    if (cantidad <= 0) return;
    onConfirm(cantidad);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-80 rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-lg font-semibold">{producto.nombre}</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Precio: {formatearSoles(producto.precioVenta)}
        </p>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Cantidad</label>
          <Input
            ref={inputRef}
            type="number"
            step={producto.unidadMedida.esFraccionable ? '0.001' : '1'}
            min="0.001"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') onClose();
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

const METODOS_PAGO: { key: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { key: 'efectivo', label: 'Efectivo', icon: <DollarSign className="h-4 w-4" /> },
  { key: 'tarjeta_debito', label: 'Tarjeta débito', icon: <CreditCard className="h-4 w-4" /> },
  { key: 'tarjeta_credito', label: 'Tarjeta crédito', icon: <CreditCard className="h-4 w-4" /> },
  { key: 'yape', label: 'Yape', icon: <Smartphone className="h-4 w-4" /> },
  { key: 'plin', label: 'Plin', icon: <Smartphone className="h-4 w-4" /> },
  { key: 'qr', label: 'QR', icon: <Smartphone className="h-4 w-4" /> },
];

interface PaymentModalProps {
  total: number;
  onConfirm: (pagos: Array<{ metodoPago: MetodoPago; monto: number }>) => void;
  onClose: () => void;
}

function PaymentModal({ total, onConfirm, onClose }: PaymentModalProps) {
  const [pagos, setPagos] = useState<Array<{ metodoPago: MetodoPago; monto: number }>>([]);

  const sumaPagos = useMemo(() => pagos.reduce((s, p) => s + p.monto, 0), [pagos]);
  const vuelto = useMemo(() => Math.max(0, sumaPagos - total), [sumaPagos, total]);

  const agregarPago = (metodoPago: MetodoPago) => {
    if (pagos.some((p) => p.metodoPago === metodoPago)) return;
    setPagos([...pagos, { metodoPago, monto: 0 }]);
  };

  const actualizarMonto = (metodoPago: MetodoPago, monto: number) => {
    setPagos(pagos.map((p) => (p.metodoPago === metodoPago ? { ...p, monto } : p)));
  };

  const quitarPago = (metodoPago: MetodoPago) => {
    setPagos(pagos.filter((p) => p.metodoPago !== metodoPago));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-96 rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-semibold">Cobrar</h3>

        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">Total a cobrar</p>
          <p className="text-3xl font-bold">{formatearSoles(total)}</p>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Métodos de pago</p>
          <div className="flex flex-wrap gap-1.5">
            {METODOS_PAGO.map((m) => (
              <Button
                key={m.key}
                variant={pagos.some((p) => p.metodoPago === m.key) ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  pagos.some((p) => p.metodoPago === m.key)
                    ? quitarPago(m.key)
                    : agregarPago(m.key)
                }
              >
                {m.icon}
                <span className="ml-1">{m.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {pagos.length > 0 && (
          <div className="mb-4 space-y-2">
            {pagos.map((pago) => (
              <div key={pago.metodoPago} className="flex items-center gap-2">
                <span className="w-28 text-sm font-medium">
                  {METODOS_PAGO.find((m) => m.key === pago.metodoPago)?.label}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={pago.monto || ''}
                  onChange={(e) => actualizarMonto(pago.metodoPago, Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">S/</span>
              </div>
            ))}
          </div>
        )}

        {vuelto > 0 && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-center">
            <p className="text-sm text-green-700">Vuelto</p>
            <p className="text-2xl font-bold text-green-700">{formatearSoles(vuelto)}</p>
          </div>
        )}

        <div className="mb-4 flex justify-between text-sm">
          <span>Suma pagos</span>
          <span className={sumaPagos >= total ? 'text-green-600 font-medium' : 'text-red-500'}>
            {formatearSoles(sumaPagos)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={sumaPagos < total - 0.01}
            onClick={() =>
              onConfirm(pagos.filter((p) => p.monto > 0))
            }
          >
            Confirmar pago
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PosPage() {
  const navigate = useNavigate();
  const turnoActivo = useAuthStore((s) => s.turnoActivo);
  const { items, agregarItem, quitarItem, actualizarCantidad, limpiarCarrito } = usePosStore();
  const { create } = useVentaMutations();

  const [searchValue, setSearchValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [quantityModalProducto, setQuantityModalProducto] = useState<Producto | null>(null);
  const [quantityModalInitial, setQuantityModalInitial] = useState(1);
  const [quantityModalEditId, setQuantityModalEditId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [suggestions, setSuggestions] = useState<Producto[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    if (!turnoActivo) {
      toast.error('Debe abrir un turno antes de usar el POS');
      navigate(ROUTES.CAJA);
    }
  }, [turnoActivo, navigate]);

  useEffect(() => {
    searchRef.current?.focus();
  }, [items]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        if (items.length > 0) setShowPaymentModal(true);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        if (items.length === 0) return;
        const motivo = window.prompt('Motivo de cancelación:');
        if (motivo !== null) {
          limpiarCarrito();
          toast.info('Venta cancelada');
        }
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setQuantityModalProducto(null);
        setQuantityModalEditId(null);
        setShowPaymentModal(false);
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [items, limpiarCarrito]);

  useEffect(() => {
    if (debouncedSearch.length >= 3) {
      setIsSearching(true);
      ventasService
        .searchProductos(debouncedSearch)
        .then((res) => {
          setSuggestions(res.data.content);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(0);
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        })
        .finally(() => setIsSearching(false));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const agregarProducto = useCallback(
    (producto: Producto) => {
      if (producto.unidadMedida.esFraccionable) {
        setQuantityModalProducto(producto);
        setQuantityModalInitial(1);
        setQuantityModalEditId(null);
      } else {
        agregarItem(producto, 1);
        toast.success(`${producto.nombre} agregado`);
      }
      setSearchValue('');
      setShowSuggestions(false);
      setSuggestions([]);
      searchRef.current?.focus();
    },
    [agregarItem],
  );

  const handleSearch = useCallback(async () => {
    const codigo = searchValue.trim();
    if (!codigo) return;

    if (showSuggestions && suggestions.length > 0) {
      const selected = suggestions[selectedSuggestionIndex];
      if (selected) {
        agregarProducto(selected);
        return;
      }
    }

    setBusy(true);
    try {
      const res = await ventasService.getProductoByBarras(codigo);
      agregarProducto(res.data);
    } catch {
      toast.error('Producto no encontrado');
      setSearchValue('');
    } finally {
      setBusy(false);
      searchRef.current?.focus();
    }
  }, [searchValue, agregarProducto, showSuggestions, suggestions, selectedSuggestionIndex]);

  const handlePagar = (pagos: Array<{ metodoPago: MetodoPago; monto: number }>) => {
    if (!turnoActivo || pagos.length === 0) return;
    create.mutate(
      {
        idTurno: turnoActivo.idTurno,
        items: items.map((i) => ({
          idProducto: i.producto.idProducto,
          cantidad: i.cantidad,
          descuento: i.descuento,
        })),
        pagos: pagos.map((p) => ({
          metodoPago: p.metodoPago,
          monto: p.monto,
        })),
      },
      {
        onSuccess: () => {
          limpiarCarrito();
          setShowPaymentModal(false);
        },
      },
    );
  };

  const handleCancelar = () => {
    if (items.length === 0) return;
    if (window.confirm('¿Está seguro de cancelar la venta?')) {
      limpiarCarrito();
      toast.info('Venta cancelada');
    }
    searchRef.current?.focus();
  };

  const { totalItems, subtotal, igv, total } = useMemo(() => {
    const totalItems = items.reduce((s, i) => s + i.cantidad, 0);
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const igvTotal = items.reduce((s, i) => {
      if (i.producto.igvIncluido) {
        return s + i.subtotal * 0.18 / 1.18;
      }
      return s + i.subtotal * 0.18;
    }, 0);
    const total = subtotal + igvTotal;
    return { totalItems, subtotal, igv: igvTotal, total };
  }, [items]);

  if (!turnoActivo) return null;

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="flex w-3/5 flex-col border-r">
          <div className="border-b bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{turnoActivo.caja.nombre}</span>
                <span className="mx-2 text-muted-foreground">|</span>
                <span className="text-muted-foreground">{turnoActivo.usuario.nombreCompleto}</span>
              </div>
              <span className="text-xs text-muted-foreground">F1: Cobrar | F2: Cancelar | Esc: Cerrar</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Código de barras o nombre del producto..."
                className="pl-9 h-10 text-base"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedSuggestionIndex((prev) =>
                      Math.min(prev + 1, suggestions.length - 1),
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                disabled={busy}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-40 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto"
                >
                  {suggestions.map((prod, idx) => (
                    <div
                      key={prod.idProducto}
                      className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                        idx === selectedSuggestionIndex
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => agregarProducto(prod)}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="truncate">
                          <p className="font-medium truncate">{prod.nombre}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {prod.codigoBarras ? `Código: ${prod.codigoBarras}` : '—'}
                            {' | '}Stock: {prod.stockActual} {prod.unidadMedida.codigo}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm shrink-0 ml-2">
                        {formatearSoles(prod.precioVenta)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingCart className="mb-2 h-12 w-12 opacity-30" />
                <p>Escaneé o busque un producto para comenzar</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium text-center">Cant</th>
                    <th className="pb-2 font-medium text-right">Precio</th>
                    <th className="pb-2 font-medium text-right">Subtotal</th>
                    <th className="pb-2 font-medium text-right">Desc.</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.producto.idProducto} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2">{item.producto.nombre}</td>
                      <td
                        className="py-2 text-center cursor-pointer hover:text-primary"
                        title="Click para cambiar cantidad"
                        onClick={() => {
                          setQuantityModalProducto(item.producto);
                          setQuantityModalInitial(item.cantidad);
                          setQuantityModalEditId(item.producto.idProducto);
                        }}
                      >
                        {formatearCantidad(item.cantidad, item.producto.unidadMedida.esFraccionable)}
                      </td>
                      <td className="py-2 text-right font-mono">{formatearSoles(item.producto.precioVenta)}</td>
                      <td className="py-2 text-right font-mono">{formatearSoles(item.subtotal)}</td>
                      <td className="py-2 text-right text-muted-foreground">{formatearSoles(item.descuento)}</td>
                      <td className="py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => quitarItem(item.producto.idProducto)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex w-2/5 flex-col p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Resumen de venta</h3>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatearSoles(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IGV (18%)</span>
              <span>{formatearSoles(igv)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-xl font-bold">
              <span>TOTAL</span>
              <span>{formatearSoles(total)}</span>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Método de pago rápido</p>
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.slice(0, 3).map((m) => (
                <Button
                  key={m.key}
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    if (items.length > 0) setShowPaymentModal(true);
                  }}
                >
                  {m.icon}
                  <span className="ml-2">{m.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <Button
              className="w-full h-12 text-base"
              disabled={items.length === 0}
              onClick={() => setShowPaymentModal(true)}
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Cobrar
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={items.length === 0}
              onClick={handleCancelar}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancelar venta
            </Button>
          </div>
        </div>
      </div>

      {quantityModalProducto && (
        <QuantityModal
          producto={quantityModalProducto}
          initialCantidad={quantityModalInitial}
          onConfirm={(cantidad) => {
            if (quantityModalEditId) {
              actualizarCantidad(quantityModalEditId, cantidad);
              toast.success('Cantidad actualizada');
            } else {
              agregarItem(quantityModalProducto, cantidad);
              toast.success(`${quantityModalProducto.nombre} agregado`);
            }
            setQuantityModalProducto(null);
            setQuantityModalEditId(null);
            searchRef.current?.focus();
          }}
          onClose={() => {
            setQuantityModalProducto(null);
            setQuantityModalEditId(null);
            searchRef.current?.focus();
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          total={total}
          onConfirm={handlePagar}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}
