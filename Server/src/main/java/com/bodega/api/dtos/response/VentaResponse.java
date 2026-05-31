package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class VentaResponse {
    private Long idVenta;
    private String numeroTicket;
    private Instant fechaHora;
    private String clienteNombre;
    private String clienteDoc;
    private BigDecimal subtotal;
    private BigDecimal descuentoTotal;
    private BigDecimal igv;
    private BigDecimal total;
    private String estado;
    private String motivoAnulacion;
    private TurnoInfo turno;
    private UsuarioInfo usuario;
    private List<DetalleVentaResponse> detalles;
    private List<PagoVentaResponse> pagos;

    @Getter
    @Builder
    public static class TurnoInfo {
        private Long idTurno;
        private String caja;
    }

    @Getter
    @Builder
    public static class UsuarioInfo {
        private Long idUsuario;
        private String nombreCompleto;
    }

    @Getter
    @Builder
    public static class DetalleVentaResponse {
        private Long idDetalle;
        private Long idProducto;
        private String producto;
        private String codigoBarras;
        private BigDecimal cantidad;
        private BigDecimal precioHist;
        private BigDecimal descuento;
        private BigDecimal subtotal;
    }

    @Getter
    @Builder
    public static class PagoVentaResponse {
        private Long idPago;
        private String metodoPago;
        private BigDecimal monto;
        private String referencia;
    }
}
