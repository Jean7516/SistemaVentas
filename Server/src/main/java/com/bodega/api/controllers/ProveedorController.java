package com.bodega.api.controllers;

import com.bodega.api.dtos.request.ProveedorRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.ProveedorResponse;
import com.bodega.domain.entities.Proveedor;
import com.bodega.domain.ports.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final CompraService compraService;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        var proveedores = compraService.proveedorListarPaginado(search, page, size).stream()
                .map(this::toResponse)
                .toList();
        var total = compraService.proveedorContarPaginado(search);
        var totalPages = (int) Math.ceil((double) total / size);
        var response = Map.of(
                "content", proveedores,
                "totalElements", total,
                "totalPages", totalPages,
                "number", page,
                "size", size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProveedorResponse>> obtenerPorId(@PathVariable Long id) {
        var proveedor = compraService.obtenerProveedor(id);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(proveedor)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProveedorResponse>> crear(@Valid @RequestBody ProveedorRequest request) {
        var proveedor = toEntity(request);
        var creado = compraService.crearProveedor(proveedor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toResponse(creado), "Proveedor creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProveedorResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody ProveedorRequest request) {
        var proveedor = toEntity(request);
        var actualizado = compraService.actualizarProveedor(id, proveedor);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(actualizado), "Proveedor actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        compraService.eliminarProveedor(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Proveedor eliminado exitosamente"));
    }

    private Proveedor toEntity(ProveedorRequest request) {
        var p = new Proveedor();
        p.setRazonSocial(request.getRazonSocial());
        p.setRuc(request.getRuc());
        p.setContacto(request.getContacto());
        p.setTelefono(request.getTelefono());
        p.setEmail(request.getEmail());
        p.setDireccion(request.getDireccion());
        return p;
    }

    private ProveedorResponse toResponse(Proveedor proveedor) {
        return ProveedorResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .razonSocial(proveedor.getRazonSocial())
                .ruc(proveedor.getRuc())
                .contacto(proveedor.getContacto())
                .telefono(proveedor.getTelefono())
                .email(proveedor.getEmail())
                .direccion(proveedor.getDireccion())
                .activo(proveedor.getActivo())
                .creadoEn(proveedor.getCreadoEn())
                .build();
    }
}
