package com.bodega.api.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String mensaje;
    private Instant timestamp;
    private ErrorDetail error;

    public static <T> ApiResponse<T> ok(T data, String mensaje) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .mensaje(mensaje)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, "Operación exitosa");
    }

    public static <T> ApiResponse<T> error(String codigo, String mensaje, String detalle) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(new ErrorDetail(codigo, mensaje, detalle))
                .timestamp(Instant.now())
                .build();
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetail {
        private String codigo;
        private String mensaje;
        private String detalle;
    }
}
