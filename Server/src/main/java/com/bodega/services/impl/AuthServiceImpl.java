package com.bodega.services.impl;

import com.bodega.core.exceptions.NegocioException;
import com.bodega.core.exceptions.UsuarioNoEncontradoException;
import com.bodega.domain.entities.Usuario;
import com.bodega.domain.ports.AuthService;
import com.bodega.domain.ports.UsuarioRepository;
import com.bodega.domain.ports.auth.LoginResult;
import com.bodega.infrastructure.security.AuditContext;
import com.bodega.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional(readOnly = true)
    public LoginResult login(String username, String password) {
        var usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsuarioNoEncontradoException(username));

        if (!usuario.getActivo()) {
            throw new NegocioException("USUARIO_INACTIVO",
                    "El usuario '" + username + "' está desactivado",
                    "Contacte al administrador para reactivar su cuenta");
        }

        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new NegocioException("CREDENCIALES_INVALIDAS",
                    "Contraseña incorrecta", "Verifique sus credenciales");
        }

        var token = jwtService.generarToken(
                usuario.getIdUsuario(),
                usuario.getUsername(),
                usuario.getRol().name());

        return new LoginResult(
                token,
                usuario.getIdUsuario(),
                usuario.getUsername(),
                usuario.getRol().name());
    }

    @Override
    @Transactional
    public Usuario registrar(Usuario usuario, String passwordPlano) {
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new NegocioException("USUARIO_EXISTE",
                    "El username '" + usuario.getUsername() + "' ya está registrado",
                    "Elija un username diferente");
        }

        usuario.setPasswordHash(passwordEncoder.encode(passwordPlano));
        return usuarioRepository.save(usuario);
    }

    @Override
    public Long obtenerIdUsuarioActual() {
        return AuditContext.getUsuarioId();
    }

    @Override
    public boolean tienePermiso(Long idUsuario, String recurso, String accion) {
        return usuarioRepository.findById(idUsuario)
                .map(usuario -> switch (usuario.getRol()) {
                    case ADMIN -> true;
                    case SUPERVISOR -> !"usuarios".equals(recurso);
                    case CAJERO -> "ventas".equals(recurso) && "crear".equals(accion);
                    case ALMACENERO -> "productos".equals(recurso) || "compras".equals(recurso);
                })
                .orElse(false);
    }
}
