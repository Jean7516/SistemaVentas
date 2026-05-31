package com.bodega.domain.ports;

import com.bodega.domain.entities.Producto;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository {
    List<Producto> findAll();
    Optional<Producto> findById(Long id);
    Optional<Producto> findByCodigoBarras(String codigoBarras);
    List<Producto> findStockBajo();
    List<Producto> findPaginado(String search, Long categoriaId, int page, int size);
    long countPaginado(String search, Long categoriaId);
    Producto save(Producto producto);
    void deleteById(Long id);
}
