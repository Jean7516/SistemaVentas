package com.bodega.api.controllers;

import com.bodega.api.dtos.request.LoginRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.LoginResponse;
import com.bodega.domain.ports.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        var result = authService.login(request.username(), request.password());

        var response = LoginResponse.of(
                result.token(),
                result.idUsuario(),
                result.username(),
                result.rol());

        return ResponseEntity.ok(ApiResponse.ok(response, "Inicio de sesión exitoso"));
    }
}
