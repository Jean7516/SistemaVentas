package com.bodega.core.exceptions;

public class UsuarioNoEncontradoException extends BaseException {
    public UsuarioNoEncontradoException(String username) {
        super("USUARIO_NO_ENCONTRADO",
                "Usuario '" + username + "' no encontrado",
                "Verifique que el username sea correcto");
    }
}
