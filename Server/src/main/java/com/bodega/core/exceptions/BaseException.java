package com.bodega.core.exceptions;

import lombok.Getter;

@Getter
public abstract class BaseException extends RuntimeException {
    private final String codigo;
    private final String detalle;

    protected BaseException(String codigo, String mensaje, String detalle) {
        super(mensaje);
        this.codigo = codigo;
        this.detalle = detalle;
    }
}
