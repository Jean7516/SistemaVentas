package com.bodega.repositories;

import com.bodega.domain.entities.Proveedor;
import com.bodega.domain.ports.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ProveedorRepositoryAdapter implements ProveedorRepository {

    private final ProveedorJpaRepository jpa;

    @Override
    public List<Proveedor> findAll() {
        return jpa.findAll();
    }

    @Override
    public List<Proveedor> findPaginado(String search, int page, int size) {
        return jpa.findPaginado(toLikePattern(search), PageRequest.of(page, size));
    }

    @Override
    public long countPaginado(String search) {
        return jpa.countPaginado(toLikePattern(search));
    }

    @Override
    public Optional<Proveedor> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Proveedor save(Proveedor proveedor) {
        return jpa.save(proveedor);
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
