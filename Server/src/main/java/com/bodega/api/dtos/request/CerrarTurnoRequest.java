package com.bodega.api.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CerrarTurnoRequest {

    @NotNull(message = "El monto de cierre es obligatorio")
    @Positive(message = "El monto de cierre debe ser positivo")
    private BigDecimal montoCierre;

    private String observaciones;
}
