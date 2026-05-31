package com.bodega.api.controllers;

import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.ResumenTurnoResponse;
import com.bodega.domain.ports.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/turnos/{id}")
    public ResponseEntity<ApiResponse<ResumenTurnoResponse>> resumenTurno(@PathVariable Long id) {
        var resumen = reporteService.obtenerResumenTurno(id);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(resumen)));
    }

    @GetMapping("/turnos")
    public ResponseEntity<ApiResponse<List<ResumenTurnoResponse>>> listarResumenTurnos() {
        var lista = reporteService.listarResumenTurnos().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(lista));
    }

    private ResumenTurnoResponse toResponse(ReporteService.ResumenTurno r) {
        return ResumenTurnoResponse.builder()
                .idTurno(r.idTurno())
                .caja(r.caja())
                .cajero(r.cajero())
                .apertura(r.apertura())
                .cierre(r.cierre())
                .estado(r.estado())
                .montoApertura(r.montoApertura())
                .montoCierre(r.montoCierre())
                .diferencia(r.diferencia())
                .numVentas(r.numVentas())
                .totalVendido(r.totalVendido())
                .build();
    }
}
