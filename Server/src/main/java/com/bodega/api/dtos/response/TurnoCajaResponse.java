package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class TurnoCajaResponse {
    private Long idTurno;
    private CajaInfo caja;
    private UsuarioInfo usuario;
    private Instant apertura;
    private Instant cierre;
    private BigDecimal montoApertura;
    private BigDecimal montoCierre;
    private BigDecimal diferencia;
    private String estado;
    private String observaciones;

    @Getter @Builder
    public static class CajaInfo {
        private Long idCaja;
        private String nombre;
    }

    @Getter @Builder
    public static class UsuarioInfo {
        private Long idUsuario;
        private String nombreCompleto;
    }
}
