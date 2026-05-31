package com.bodega.api.controllers;

import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.AuditoriaResponse;
import com.bodega.domain.ports.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auditoria")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditoriaResponse>>> buscar(
            @RequestParam(required = false) String tabla,
            @RequestParam(required = false) Instant desde,
            @RequestParam(required = false) Instant hasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var resultados = auditoriaService.buscar(tabla, desde, hasta, page, size).stream()
                .map(a -> AuditoriaResponse.builder()
                        .idAuditoria(a.getIdAuditoria())
                        .tablaAfectada(a.getTablaAfectada())
                        .pkRegistro(a.getPkRegistro())
                        .accion(a.getAccion())
                        .usuario(a.getUsuario() != null ? a.getUsuario().getNombreCompleto() : null)
                        .fechaHora(a.getFechaHora())
                        .ipOrigen(a.getIpOrigen())
                        .datosAnteriores(a.getDatosAnteriores())
                        .datosNuevos(a.getDatosNuevos())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(resultados));
    }
}
