package com.bodega.api.controllers;

import com.bodega.api.dtos.request.ProductoRequest;
import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.api.dtos.response.ProductoResponse;
import com.bodega.domain.entities.Categoria;
import com.bodega.domain.entities.Producto;
import com.bodega.domain.entities.UnidadMedida;
import com.bodega.domain.ports.CategoriaRepository;
import com.bodega.domain.ports.ProductoService;
import com.bodega.domain.ports.UnidadMedidaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;
    private final CategoriaRepository categoriaRepository;
    private final UnidadMedidaRepository unidadMedidaRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoria) {
        var productos = productoService.listarPaginado(search, categoria, page, size).stream()
                .map(this::toResponse)
                .toList();
        var total = productoService.contarPaginado(search, categoria);
        var totalPages = (int) Math.ceil((double) total / size);
        var response = Map.of(
                "content", productos,
                "totalElements", total,
                "totalPages", totalPages,
                "number", page,
                "size", size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductoResponse>> obtenerPorId(@PathVariable Long id) {
        var producto = productoService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(producto)));
    }

    @GetMapping("/barras/{codigo}")
    public ResponseEntity<ApiResponse<ProductoResponse>> obtenerPorCodigoBarras(@PathVariable String codigo) {
        var producto = productoService.obtenerPorCodigoBarras(codigo);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(producto)));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<ApiResponse<List<ProductoResponse>>> stockBajo() {
        var productos = productoService.stockBajo().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(productos, "Productos con stock bajo"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductoResponse>> crear(@Valid @RequestBody ProductoRequest request) {
        var producto = toEntity(request);
        var creado = productoService.crear(producto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toResponse(creado), "Producto creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductoResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        var producto = toEntity(request);
        var actualizado = productoService.actualizar(id, producto);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(actualizado), "Producto actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Producto eliminado exitosamente"));
    }

    private Producto toEntity(ProductoRequest request) {
        var producto = new Producto();
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setSku(request.getSku());
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());

        var categoria = new Categoria();
        categoria.setIdCategoria(request.getIdCategoria());
        producto.setCategoria(categoria);

        var unidad = new UnidadMedida();
        unidad.setIdUm(request.getIdUnidadMedida());
        producto.setUnidadMedida(unidad);

        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setPrecioCosto(request.getPrecioCosto());
        producto.setIgvIncluido(request.getIgvIncluido());
        producto.setStockActual(request.getStockActual());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setUbicacion(request.getUbicacion());
        return producto;
    }

    private ProductoResponse toResponse(Producto producto) {
        return ProductoResponse.builder()
                .idProducto(producto.getIdProducto())
                .codigoBarras(producto.getCodigoBarras())
                .sku(producto.getSku())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .categoria(ProductoResponse.CategoriaInfo.builder()
                        .idCategoria(producto.getCategoria().getIdCategoria())
                        .nombre(producto.getCategoria().getNombre())
                        .build())
                .unidadMedida(ProductoResponse.UnidadMedidaInfo.builder()
                        .idUm(producto.getUnidadMedida().getIdUm())
                        .codigo(producto.getUnidadMedida().getCodigo())
                        .nombre(producto.getUnidadMedida().getNombre())
                        .esFraccionable(producto.getUnidadMedida().getEsFraccionable())
                        .build())
                .precioVenta(producto.getPrecioVenta())
                .precioCosto(producto.getPrecioCosto())
                .igvIncluido(producto.getIgvIncluido())
                .stockActual(producto.getStockActual())
                .stockMinimo(producto.getStockMinimo())
                .ubicacion(producto.getUbicacion())
                .activo(producto.getActivo())
                .creadoEn(producto.getCreadoEn())
                .actualizadoEn(producto.getActualizadoEn())
                .build();
    }
}
