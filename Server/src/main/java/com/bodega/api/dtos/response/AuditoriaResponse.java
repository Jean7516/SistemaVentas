package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AuditoriaResponse {
    private Long idAuditoria;
    private String tablaAfectada;
    private Long pkRegistro;
    private String accion;
    private String usuario;
    private Instant fechaHora;
    private String ipOrigen;
    private String datosAnteriores;
    private String datosNuevos;
}
