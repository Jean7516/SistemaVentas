package com.bodega.api.controllers;

import com.bodega.api.dtos.request.ActualizarUsuarioRequest;
import com.bodega.api.dtos.request.CrearUsuarioRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.UsuarioResponse;
import com.bodega.core.exceptions.NegocioException;
import com.bodega.domain.entities.Usuario;
import com.bodega.domain.enums.Rol;
import com.bodega.domain.ports.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        var usuarios = usuarioRepository.findPaginado(search, page, size).stream()
                .map(this::toResponse)
                .toList();
        var total = usuarioRepository.countPaginado(search);
        var totalPages = (int) Math.ceil((double) total / size);
        var response = Map.of(
                "content", usuarios,
                "totalElements", total,
                "totalPages", totalPages,
                "number", page,
                "size", size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioResponse>> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new NegocioException("USUARIO_EXISTE",
                    "El username '" + request.getUsername() + "' ya está registrado",
                    "Elija un username diferente");
        }

        var usuario = new Usuario();
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setUsername(request.getUsername());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(Rol.valueOf(request.getRol()));
        usuario.setActivo(true);

        var creado = usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toResponse(creado), "Usuario creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody ActualizarUsuarioRequest request) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NegocioException("USUARIO_NO_ENCONTRADO",
                        "Usuario con id " + id + " no encontrado", ""));

        if (request.getNombreCompleto() != null) {
            usuario.setNombreCompleto(request.getNombreCompleto());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRol() != null) {
            usuario.setRol(Rol.valueOf(request.getRol()));
        }
        if (request.getActivo() != null) {
            usuario.setActivo(request.getActivo());
        }

        var actualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(actualizado), "Usuario actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NegocioException("USUARIO_NO_ENCONTRADO",
                        "Usuario con id " + id + " no encontrado", ""));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(ApiResponse.ok(null, "Usuario eliminado exitosamente"));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .idUsuario(usuario.getIdUsuario())
                .nombreCompleto(usuario.getNombreCompleto())
                .username(usuario.getUsername())
                .rol(usuario.getRol().name())
                .activo(usuario.getActivo())
                .build();
    }
}
