package com.bodega.api.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class CompraResponse {
    private Long idCompra;
    private ProveedorInfo proveedor;
    private UsuarioInfo usuario;
    private String numeroFactura;
    @JsonProperty("fechaHora")
    private Instant fechaRegistro;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;
    private String estado;
    private String observaciones;
    @JsonProperty("detalle")
    private List<DetalleCompraResponse> detalles;

    @Getter
    @Builder
    public static class ProveedorInfo {
        private Long idProveedor;
        private String razonSocial;
        private String ruc;
        private String contacto;
        private String telefono;
        private String email;
        private String direccion;
        private Boolean activo;
    }

    @Getter
    @Builder
    public static class UsuarioInfo {
        private Long idUsuario;
        private String nombreCompleto;
    }

    @Getter
    @Builder
    public static class DetalleCompraResponse {
        private Long idDetalle;
        private Long idProducto;
        private String producto;
        private BigDecimal cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
