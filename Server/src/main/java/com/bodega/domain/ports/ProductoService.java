package com.bodega.domain.ports;

import com.bodega.domain.entities.Producto;

import java.util.List;

public interface ProductoService {
    List<Producto> listarTodos();
    Producto obtenerPorId(Long id);
    Producto obtenerPorCodigoBarras(String codigoBarras);
    List<Producto> stockBajo();

    List<Producto> listarPaginado(String search, Long categoriaId, int page, int size);
    long contarPaginado(String search, Long categoriaId);

    Producto crear(Producto producto);
    Producto actualizar(Long id, Producto producto);
    void eliminar(Long id);
}
