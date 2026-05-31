package com.bodega.api.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AbrirTurnoRequest {

    @NotNull(message = "El id de caja es obligatorio")
    private Long idCaja;

    @NotNull(message = "El monto de apertura es obligatorio")
    @Positive(message = "El monto de apertura debe ser positivo")
    private BigDecimal montoApertura = BigDecimal.ZERO;

    private String observaciones;
}
