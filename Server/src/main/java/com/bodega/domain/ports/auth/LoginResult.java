package com.bodega.domain.ports.auth;

public record LoginResult(
        String token,
        Long idUsuario,
        String username,
        String rol
) {}
