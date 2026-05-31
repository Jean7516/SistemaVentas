package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ProveedorResponse {
    private Long idProveedor;
    private String razonSocial;
    private String ruc;
    private String contacto;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean activo;
    private Instant creadoEn;
}
