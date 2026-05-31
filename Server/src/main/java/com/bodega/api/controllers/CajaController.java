package com.bodega.api.controllers;

import com.bodega.api.dtos.request.AbrirTurnoRequest;
import com.bodega.api.dtos.request.CerrarTurnoRequest;
import com.bodega.api.dtos.request.MovimientoCajaRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.MovimientoCajaResponse;
import com.bodega.api.dtos.response.TurnoCajaResponse;
import com.bodega.domain.ports.AuthService;
import com.bodega.domain.ports.TurnoCajaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CajaController {

    private final TurnoCajaService turnoCajaService;
    private final com.bodega.domain.ports.CajaRepository cajaRepository;
    private final AuthService authService;

    // ─── Cajas ───────────────────────────────────────────────
    @GetMapping("/cajas")
    public ResponseEntity<ApiResponse<List<com.bodega.domain.entities.Caja>>> listarCajas() {
        var cajas = cajaRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(cajas));
    }

    // ─── Turnos ──────────────────────────────────────────────
    @PostMapping("/turnos")
    public ResponseEntity<ApiResponse<TurnoCajaResponse>> abrirTurno(@Valid @RequestBody AbrirTurnoRequest request) {
        var turno = turnoCajaService.abrirTurno(
                request.getIdCaja(), request.getMontoApertura(), request.getObservaciones());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toTurnoResponse(turno), "Turno abierto exitosamente"));
    }

    @PutMapping("/turnos/{id}/cierre")
    public ResponseEntity<ApiResponse<TurnoCajaResponse>> cerrarTurno(
            @PathVariable Long id, @Valid @RequestBody CerrarTurnoRequest request) {
        var turno = turnoCajaService.cerrarTurno(id, request.getMontoCierre(), request.getObservaciones());
        return ResponseEntity.ok(ApiResponse.ok(toTurnoResponse(turno), "Turno cerrado exitosamente"));
    }

    @GetMapping("/turnos/activo")
    public ResponseEntity<ApiResponse<TurnoCajaResponse>> obtenerActivo() {
        var turno = turnoCajaService.obtenerActivo();
        if (turno == null) {
            return ResponseEntity.ok(ApiResponse.ok(null, "No hay turno activo"));
        }
        return ResponseEntity.ok(ApiResponse.ok(toTurnoResponse(turno)));
    }

    @GetMapping("/turnos")
    public ResponseEntity<ApiResponse<Object>> listarTurnos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var turnos = turnoCajaService.listarPaginado(page, size).stream()
                .map(this::toTurnoResponse)
                .toList();
        var total = turnoCajaService.contarPaginado();
        var totalPages = (int) Math.ceil((double) total / size);
        var response = Map.of(
                "content", turnos,
                "totalElements", total,
                "totalPages", totalPages,
                "number", page,
                "size", size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ─── Movimientos ─────────────────────────────────────────
    @PostMapping("/turnos/{id}/movimientos")
    public ResponseEntity<ApiResponse<MovimientoCajaResponse>> registrarMovimiento(
            @PathVariable Long id, @Valid @RequestBody MovimientoCajaRequest request) {
        var movimiento = turnoCajaService.registrarMovimiento(
                id, request.getTipo(), request.getMonto(), request.getDescripcion(), request.getReferencia());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toMovimientoResponse(movimiento), "Movimiento registrado exitosamente"));
    }

    @GetMapping("/turnos/{id}/movimientos")
    public ResponseEntity<ApiResponse<List<MovimientoCajaResponse>>> listarMovimientos(@PathVariable Long id) {
        var movimientos = turnoCajaService.listarMovimientos(id).stream()
                .map(this::toMovimientoResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(movimientos));
    }

    // ─── Mappers ────────────────────────────────────────────
    private TurnoCajaResponse toTurnoResponse(com.bodega.domain.entities.TurnoCaja turno) {
        return TurnoCajaResponse.builder()
                .idTurno(turno.getIdTurno())
                .caja(TurnoCajaResponse.CajaInfo.builder()
                        .idCaja(turno.getCaja().getIdCaja())
                        .nombre(turno.getCaja().getNombre())
                        .build())
                .usuario(TurnoCajaResponse.UsuarioInfo.builder()
                        .idUsuario(turno.getUsuario().getIdUsuario())
                        .nombreCompleto(turno.getUsuario().getNombreCompleto())
                        .build())
                .apertura(turno.getApertura())
                .cierre(turno.getCierre())
                .montoApertura(turno.getMontoApertura())
                .montoCierre(turno.getMontoCierre())
                .diferencia(turno.getDiferencia())
                .estado(turno.getEstado().name())
                .observaciones(turno.getObservaciones())
                .build();
    }

    private MovimientoCajaResponse toMovimientoResponse(com.bodega.domain.entities.MovimientoCaja movimiento) {
        return MovimientoCajaResponse.builder()
                .idMovimiento(movimiento.getIdMovimiento())
                .turno(MovimientoCajaResponse.TurnoCajaInfo.builder()
                        .idTurno(movimiento.getTurno().getIdTurno())
                        .build())
                .tipo(movimiento.getTipo().name())
                .monto(movimiento.getMonto())
                .descripcion(movimiento.getConcepto())
                .referencia(movimiento.getReferencia())
                .creadoEn(movimiento.getFechaHora())
                .build();
    }
}
