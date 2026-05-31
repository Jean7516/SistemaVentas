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
public class CrearVentaRequest {

    @NotNull(message = "El id del turno es obligatorio")
    private Long idTurno;

    private String clienteNombre;
    private String clienteDoc;

    @NotEmpty(message = "Debe incluir al menos un producto")
    private List<@Valid ItemVentaRequest> items;

    @NotEmpty(message = "Debe incluir al menos un pago")
    private List<@Valid PagoVentaRequest> pagos;

    @Getter
    @Setter
    public static class ItemVentaRequest {
        @NotNull(message = "El id del producto es obligatorio")
        private Long idProducto;

        @NotNull(message = "La cantidad es obligatoria")
        private BigDecimal cantidad;

        private BigDecimal descuento = BigDecimal.ZERO;
    }

    @Getter
    @Setter
    public static class PagoVentaRequest {
        @NotNull(message = "El método de pago es obligatorio")
        private String metodoPago;

        @NotNull(message = "El monto es obligatorio")
        private BigDecimal monto;

        private String referencia;
    }
}
