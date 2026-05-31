package com.bodega.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductoRequest {

    private String codigoBarras;

    private String sku;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "La categoría es obligatoria")
    private Long idCategoria;

    @NotNull(message = "La unidad de medida es obligatoria")
    private Long idUnidadMedida;

    @NotNull(message = "El precio de venta es obligatorio")
    @Positive(message = "El precio de venta debe ser positivo")
    private BigDecimal precioVenta;

    @NotNull(message = "El precio de costo es obligatorio")
    @Positive(message = "El precio de costo debe ser positivo")
    private BigDecimal precioCosto;

    private Boolean igvIncluido = true;

    private BigDecimal stockActual = BigDecimal.ZERO;

    private BigDecimal stockMinimo = BigDecimal.ZERO;

    private String ubicacion;
}
