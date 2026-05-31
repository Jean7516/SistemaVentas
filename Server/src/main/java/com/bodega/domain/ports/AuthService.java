package com.bodega.domain.ports;

import com.bodega.domain.entities.Usuario;
import com.bodega.domain.ports.auth.LoginResult;

public interface AuthService {
    LoginResult login(String username, String password);
    Usuario registrar(Usuario usuario, String passwordPlano);
    Long obtenerIdUsuarioActual();
    boolean tienePermiso(Long idUsuario, String recurso, String accion);
}
