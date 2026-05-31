package com.bodega.api.controllers;

import com.bodega.api.dtos.request.CrearCompraRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.CompraResponse;
import com.bodega.domain.entities.Compra;
import com.bodega.domain.ports.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String estado) {
        var compras = compraService.listarPaginado(estado, page, size).stream()
                .map(this::toCompraResponse)
                .toList();
        var total = compraService.contarPaginado(estado);
        var totalPages = (int) Math.ceil((double) total / size);
        var response = Map.of(
                "content", compras,
                "totalElements", total,
                "totalPages", totalPages,
                "number", page,
                "size", size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompraResponse>> crearCompra(@Valid @RequestBody CrearCompraRequest request) {
        var items = request.getItems().stream()
                .map(i -> new CompraService.ItemCompraInput(i.getIdProducto(), i.getCantidad(), i.getPrecioUnitario()))
                .toList();
        var compra = compraService.crearCompra(
                request.getIdProveedor(), request.getNumeroFactura(), request.getObservaciones(), items);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toCompraResponse(compra), "Compra registrada exitosamente"));
    }

    @PutMapping("/{id}/recibir")
    public ResponseEntity<ApiResponse<CompraResponse>> recibirCompra(@PathVariable Long id) {
        var compra = compraService.recibirCompra(id);
        return ResponseEntity.ok(ApiResponse.ok(toCompraResponse(compra), "Compra recibida exitosamente"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompraResponse>> obtenerCompra(@PathVariable Long id) {
        var compra = compraService.obtenerCompra(id);
        return ResponseEntity.ok(ApiResponse.ok(toCompraResponse(compra)));
    }

    private CompraResponse toCompraResponse(Compra compra) {
        return CompraResponse.builder()
                .idCompra(compra.getIdCompra())
                .proveedor(CompraResponse.ProveedorInfo.builder()
                        .idProveedor(compra.getProveedor().getIdProveedor())
                        .razonSocial(compra.getProveedor().getRazonSocial())
                        .ruc(compra.getProveedor().getRuc())
                        .contacto(compra.getProveedor().getContacto())
                        .telefono(compra.getProveedor().getTelefono())
                        .email(compra.getProveedor().getEmail())
                        .direccion(compra.getProveedor().getDireccion())
                        .activo(compra.getProveedor().getActivo())
                        .build())
                .usuario(CompraResponse.UsuarioInfo.builder()
                        .idUsuario(compra.getUsuario().getIdUsuario())
                        .nombreCompleto(compra.getUsuario().getNombreCompleto())
                        .build())
                .numeroFactura(compra.getNumeroFactura())
                .fechaRegistro(compra.getFechaRegistro())
                .subtotal(compra.getSubtotal())
                .igv(compra.getIgv())
                .total(compra.getTotal())
                .estado(compra.getEstado().name().toLowerCase())
                .observaciones(compra.getObservaciones())
                .detalles(compra.getDetalles().stream()
                        .map(d -> CompraResponse.DetalleCompraResponse.builder()
                                .idDetalle(d.getIdDetalle())
                                .idProducto(d.getProducto().getIdProducto())
                                .producto(d.getProducto().getNombre())
                                .cantidad(d.getCantidad())
                                .precioUnitario(d.getPrecioUnitario())
                                .subtotal(d.getSubtotal())
                                .build())
                        .toList())
                .build();
    }
}
