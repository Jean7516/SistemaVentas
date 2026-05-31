package com.bodega.core.exceptions;

public class NegocioException extends BaseException {
    public NegocioException(String codigo, String mensaje, String detalle) {
        super(codigo, mensaje, detalle);
    }
}
