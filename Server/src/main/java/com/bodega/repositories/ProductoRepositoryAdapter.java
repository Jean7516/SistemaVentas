package com.bodega.repositories;

import com.bodega.domain.entities.Producto;
import com.bodega.domain.ports.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ProductoRepositoryAdapter implements ProductoRepository {

    private final ProductoJpaRepository jpa;

    @Override
    public List<Producto> findAll() {
        return jpa.findAll();
    }

    @Override
    public Optional<Producto> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<Producto> findByCodigoBarras(String codigoBarras) {
        return jpa.findByCodigoBarras(codigoBarras);
    }

    @Override
    public List<Producto> findStockBajo() {
        return jpa.findStockBajo();
    }

    @Override
    public List<Producto> findPaginado(String search, Long categoriaId, int page, int size) {
        return jpa.findPaginado(toLikePattern(search), categoriaId, PageRequest.of(page, size));
    }

    @Override
    public long countPaginado(String search, Long categoriaId) {
        return jpa.countPaginado(toLikePattern(search), categoriaId);
    }

    @Override
    public Producto save(Producto producto) {
        return jpa.save(producto);
    }

    @Override
    public void deleteById(Long id) {
        jpa.deleteById(id);
    }

    private String normalizeSearch(String search) {
        return (search == null || search.isBlank()) ? null : search.trim().toLowerCase();
    }

    private String toLikePattern(String search) {
        var normalized = normalizeSearch(search);
        return normalized != null ? "%" + normalized + "%" : null;
    }
}
