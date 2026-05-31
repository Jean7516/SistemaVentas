package com.bodega.api.dtos.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActualizarUsuarioRequest {
    private String nombreCompleto;
    private String password;
    private String rol;
    private Boolean activo;
}
