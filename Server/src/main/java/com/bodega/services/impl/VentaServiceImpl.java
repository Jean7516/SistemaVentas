package com.bodega.services.impl;

import com.bodega.core.exceptions.NegocioException;
import com.bodega.core.exceptions.StockInsuficienteException;
import com.bodega.domain.entities.*;
import com.bodega.domain.enums.EstadoTurno;
import com.bodega.domain.enums.MetodoPago;
import static com.bodega.domain.enums.EstadoVenta.completada;
import static com.bodega.domain.enums.EstadoVenta.anulada;
import com.bodega.domain.ports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements VentaService {

    private static final BigDecimal IGV_TASA = new BigDecimal("0.18");
    private static final BigDecimal IGV_FACTOR = new BigDecimal("1.18");
    private static final DateTimeFormatter TICKET_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final TurnoCajaRepository turnoCajaRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public Venta crearVenta(Long idTurno, String clienteNombre, String clienteDoc,
                            List<ItemVenta> items, List<PagoInput> pagos) {
        var turno = turnoCajaRepository.findById(idTurno)
                .orElseThrow(() -> new NegocioException("TURNO_NO_ENCONTRADO",
                        "Turno con id " + idTurno + " no encontrado", ""));

        if (turno.getEstado() != EstadoTurno.abierto) {
            throw new NegocioException("TURNO_NO_ACTIVO",
                    "El turno no está activo", "Solo se pueden registrar ventas en turnos abiertos");
        }

        var productos = cargarProductos(items);

        var venta = new Venta();
        venta.setTurno(turno);
        venta.setUsuario(turno.getUsuario());
        venta.setNumeroTicket(generarTicket(LocalDate.now()));
        venta.setFechaHora(Instant.now());
        venta.setClienteNombre(clienteNombre);
        venta.setClienteDoc(clienteDoc);
        venta.setSubtotal(BigDecimal.ZERO);
        venta.setDescuentoTotal(BigDecimal.ZERO);
        venta.setIgv(BigDecimal.ZERO);
        var totalSinIgvItems = BigDecimal.ZERO;

        for (var item : items) {
            var producto = productos.get(item.idProducto());
            var itemSubtotal = producto.getPrecioVenta()
                    .multiply(item.cantidad())
                    .subtract(item.descuento());
            var itemIgv = producto.getIgvIncluido()
                    ? itemSubtotal.multiply(IGV_TASA).divide(IGV_FACTOR, 4, RoundingMode.HALF_UP)
                    : itemSubtotal.multiply(IGV_TASA).setScale(4, RoundingMode.HALF_UP);

            if (!producto.getIgvIncluido()) {
                totalSinIgvItems = totalSinIgvItems.add(itemIgv);
            }

            var detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioHist(producto.getPrecioVenta());
            detalle.setCostoHist(producto.getPrecioCosto());
            detalle.setDescuento(item.descuento());
            venta.getDetalles().add(detalle);

            venta.setSubtotal(venta.getSubtotal().add(itemSubtotal));
            venta.setDescuentoTotal(venta.getDescuentoTotal().add(item.descuento()));
            venta.setIgv(venta.getIgv().add(itemIgv));
        }

        venta.setTotal(venta.getSubtotal().add(venta.getIgv())
                .setScale(4, RoundingMode.HALF_UP));
        venta.setSubtotal(venta.getSubtotal().setScale(4, RoundingMode.HALF_UP));
        venta.setDescuentoTotal(venta.getDescuentoTotal().setScale(4, RoundingMode.HALF_UP));
        venta.setIgv(venta.getIgv().setScale(4, RoundingMode.HALF_UP));
        venta.setEstado(completada);

        for (var p : pagos) {
            var pago = new PagoVenta();
            pago.setVenta(venta);
            pago.setMetodoPago(MetodoPago.valueOf(p.metodoPago()));
            pago.setMonto(p.monto());
            pago.setReferencia(p.referencia());
            pago.setFechaHora(Instant.now());
            venta.getPagos().add(pago);
        }

        var montoPagado = pagos.stream()
                .map(PagoInput::monto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (montoPagado.compareTo(venta.getTotal()) < 0) {
            throw new NegocioException("MONTO_INSUFICIENTE",
                    "El monto total de pagos (" + montoPagado + ") es menor al total de la venta ("
                            + venta.getTotal() + ")",
                    "Registre pagos que cubran el total de la venta");
        }

        return ventaRepository.save(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public Venta obtenerVenta(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new NegocioException("VENTA_NO_ENCONTRADA",
                        "Venta con id " + id + " no encontrada", ""));
    }

    @Override
    @Transactional
    public Venta anularVenta(Long id, String motivo) {
        var venta = obtenerVenta(id);

        if (venta.getEstado() != completada) {
            throw new NegocioException("VENTA_NO_ANULABLE",
                    "La venta no puede ser anulada porque su estado es " + venta.getEstado(),
                    "Solo se pueden anular ventas en estado completada");
        }

        venta.setEstado(anulada);
        venta.setMotivoAnulacion(motivo);

        for (var detalle : venta.getDetalles()) {
            var producto = detalle.getProducto();
            producto.setStockActual(producto.getStockActual().add(detalle.getCantidad()));
            productoRepository.save(producto);
        }

        return ventaRepository.save(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> listarPorTurno(Long idTurno) {
        return ventaRepository.findByTurnoId(idTurno);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> listarPaginado(Long idTurno, int page, int size) {
        return ventaRepository.findPaginado(idTurno, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPaginado(Long idTurno) {
        return ventaRepository.countPaginado(idTurno);
    }

    private Map<Long, Producto> cargarProductos(List<ItemVenta> items) {
        var productos = new HashMap<Long, Producto>();
        for (var item : items) {
            var producto = productoRepository.findById(item.idProducto())
                    .orElseThrow(() -> new NegocioException("PRODUCTO_NO_ENCONTRADO",
                            "Producto con id " + item.idProducto() + " no encontrado", ""));

            if (producto.getStockActual().compareTo(item.cantidad()) < 0) {
                throw new StockInsuficienteException(producto.getNombre(),
                        producto.getStockActual().doubleValue(), item.cantidad().doubleValue());
            }
            productos.put(item.idProducto(), producto);
        }
        return productos;
    }

    private String generarTicket(LocalDate hoy) {
        var fechaStr = hoy.format(TICKET_DATE_FMT);
        var count = ventaRepository.countByFecha(hoy) + 1;
        return "T-" + fechaStr + "-" + String.format("%05d", count);
    }
}
