package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UsuarioResponse {
    private Long idUsuario;
    private String nombreCompleto;
    private String username;
    private String rol;
    private Boolean activo;
}
