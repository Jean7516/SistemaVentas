package com.bodega.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProveedorRequest {
    @NotBlank(message = "La razón social es obligatoria")
    private String razonSocial;

    private String ruc;
    private String contacto;
    private String telefono;
    private String email;
    private String direccion;
}
