package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class ResumenTurnoResponse {
    private Long idTurno;
    private String caja;
    private String cajero;
    private Instant apertura;
    private Instant cierre;
    private String estado;
    private BigDecimal montoApertura;
    private BigDecimal montoCierre;
    private BigDecimal diferencia;
    private Long numVentas;
    private BigDecimal totalVendido;
}
