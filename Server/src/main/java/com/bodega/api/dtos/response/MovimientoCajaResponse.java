package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class MovimientoCajaResponse {
    private Long idMovimiento;
    private TurnoCajaInfo turno;
    private String tipo;
    private BigDecimal monto;
    private String descripcion;
    private String referencia;
    private Instant creadoEn;

    @Getter @Builder
    public static class TurnoCajaInfo {
        private Long idTurno;
    }
}
