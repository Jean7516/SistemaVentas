package com.bodega.domain.ports;

import com.bodega.domain.entities.Venta;

import java.math.BigDecimal;
import java.util.List;

public interface VentaService {
    Venta crearVenta(Long idTurno, String clienteNombre, String clienteDoc,
                     List<ItemVenta> items, List<PagoInput> pagos);
    Venta obtenerVenta(Long id);
    Venta anularVenta(Long id, String motivo);
    List<Venta> listarPorTurno(Long idTurno);
    List<Venta> listarPaginado(Long idTurno, int page, int size);
    long contarPaginado(Long idTurno);

    record ItemVenta(Long idProducto, BigDecimal cantidad, BigDecimal descuento) {}
    record PagoInput(String metodoPago, BigDecimal monto, String referencia) {}
}
