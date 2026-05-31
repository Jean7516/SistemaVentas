package com.bodega.core.exceptions;

public class TurnoNoActivoException extends BaseException {
    public TurnoNoActivoException(String mensaje) {
        super("TURNO_NO_ACTIVO", mensaje,
                "No existe un turno abierto para el usuario en la caja especificada");
    }
}
