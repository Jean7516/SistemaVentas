package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class ProductoResponse {
    private Long idProducto;
    private String codigoBarras;
    private String sku;
    private String nombre;
    private String descripcion;
    private CategoriaInfo categoria;
    private UnidadMedidaInfo unidadMedida;
    private BigDecimal precioVenta;
    private BigDecimal precioCosto;
    private Boolean igvIncluido;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private String ubicacion;
    private Boolean activo;
    private Instant creadoEn;
    private Instant actualizadoEn;

    @Getter
    @Builder
    public static class CategoriaInfo {
        private Long idCategoria;
        private String nombre;
    }

    @Getter
    @Builder
    public static class UnidadMedidaInfo {
        private Long idUm;
        private String codigo;
        private String nombre;
        private Boolean esFraccionable;
    }
}
