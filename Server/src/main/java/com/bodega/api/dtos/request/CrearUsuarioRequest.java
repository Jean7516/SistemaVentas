package com.bodega.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearUsuarioRequest {
    @NotBlank
    private String nombreCompleto;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String rol;
}
