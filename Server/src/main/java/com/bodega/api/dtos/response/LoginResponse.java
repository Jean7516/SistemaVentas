package com.bodega.api.dtos.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private String tipo;
    private Long idUsuario;
    private String username;
    private String rol;

    public static LoginResponse of(String token, Long idUsuario, String username, String rol) {
        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .idUsuario(idUsuario)
                .username(username)
                .rol(rol)
                .build();
    }
}
