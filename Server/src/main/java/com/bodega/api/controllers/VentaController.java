package com.bodega.api.controllers;

import com.bodega.api.dtos.request.AnularVentaRequest;
import com.bodega.api.dtos.request.CrearVentaRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.VentaResponse;
import com.bodega.domain.ports.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<ApiResponse<VentaResponse>> crear(@Valid @RequestBody CrearVentaRequest request) {
        var items = request.getItems().stream()
                .map(i -> new VentaService.ItemVenta(i.getIdProducto(), i.getCantidad(), i.getDescuento()))
                .toList();
        var pagos = request.getPagos().stream()
                .map(p -> new VentaService.PagoInput(p.getMetodoPago(), p.getMonto(), p.getReferencia()))
                .toList();

        var venta = ventaService.crearVenta(
                request.getIdTurno(), request.getClienteNombre(), request.getClienteDoc(), items, pagos);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toResponse(venta), "Venta registrada exitosamente"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VentaResponse>> obtener(@PathVariable Long id) {
        var venta = ventaService.obtenerVenta(id);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(venta)));
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<ApiResponse<VentaResponse>> anular(
            @PathVariable Long id, @Valid @RequestBody AnularVentaRequest request) {
        var venta = ventaService.anularVenta(id, request.getMotivo());
        return ResponseEntity.ok(ApiResponse.ok(toResponse(venta), "Venta anulada exitosamente"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long turno,
            @RequestParam(required = false) String search) {
        var ventas = ventaService.listarPaginado(turno, page, size).stream()
                .map(this::toResponse)
                .toList();
        var total = ventaService.contarPaginado(turno);
        var totalPages = (int) Math.ceil((double) total / size);
        var response = Map.of(
                "content", ventas,
                "totalElements", total,
                "totalPages", totalPages,
                "number", page,
                "size", size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private VentaResponse toResponse(com.bodega.domain.entities.Venta venta) {
        return VentaResponse.builder()
                .idVenta(venta.getIdVenta())
                .numeroTicket(venta.getNumeroTicket())
                .fechaHora(venta.getFechaHora())
                .clienteNombre(venta.getClienteNombre())
                .clienteDoc(venta.getClienteDoc())
                .subtotal(venta.getSubtotal())
                .descuentoTotal(venta.getDescuentoTotal())
                .igv(venta.getIgv())
                .total(venta.getTotal())
                .estado(venta.getEstado().name())
                .motivoAnulacion(venta.getMotivoAnulacion())
                .turno(VentaResponse.TurnoInfo.builder()
                        .idTurno(venta.getTurno().getIdTurno())
                        .caja(venta.getTurno().getCaja().getNombre())
                        .build())
                .usuario(VentaResponse.UsuarioInfo.builder()
                        .idUsuario(venta.getUsuario().getIdUsuario())
                        .nombreCompleto(venta.getUsuario().getNombreCompleto())
                        .build())
                .detalles(venta.getDetalles().stream()
                        .map(d -> VentaResponse.DetalleVentaResponse.builder()
                                .idDetalle(d.getIdDetalle())
                                .idProducto(d.getProducto().getIdProducto())
                                .producto(d.getProducto().getNombre())
                                .codigoBarras(d.getProducto().getCodigoBarras())
                                .cantidad(d.getCantidad())
                                .precioHist(d.getPrecioHist())
                                .descuento(d.getDescuento())
                                .subtotal(d.getSubtotal())
                                .build())
                        .toList())
                .pagos(venta.getPagos().stream()
                        .map(p -> VentaResponse.PagoVentaResponse.builder()
                                .idPago(p.getIdPago())
                                .metodoPago(p.getMetodoPago().name())
                                .monto(p.getMonto())
                                .referencia(p.getReferencia())
                                .build())
                        .toList())
                .build();
    }
}
