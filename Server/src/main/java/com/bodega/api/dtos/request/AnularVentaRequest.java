package com.bodega.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnularVentaRequest {
    @NotBlank(message = "El motivo de anulación es obligatorio")
    private String motivo;
}
