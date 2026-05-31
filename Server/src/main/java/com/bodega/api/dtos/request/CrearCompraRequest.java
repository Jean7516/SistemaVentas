package com.bodega.api.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CrearCompraRequest {

    @NotNull(message = "El id del proveedor es obligatorio")
    private Long idProveedor;

    private String numeroFactura;
    private String observaciones;

    @NotEmpty(message = "Debe incluir al menos un producto")
    private List<@Valid ItemCompraRequest> items;

    @Getter
    @Setter
    public static class ItemCompraRequest {
        @NotNull(message = "El id del producto es obligatorio")
        private Long idProducto;

        @NotNull(message = "La cantidad es obligatoria")
        private BigDecimal cantidad;

        @NotNull(message = "El precio unitario es obligatorio")
        private BigDecimal precioUnitario;
    }
}
