package com.bodega.repositories;

import com.bodega.domain.entities.Compra;
import com.bodega.domain.ports.CompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CompraRepositoryAdapter implements CompraRepository {

    private final CompraJpaRepository jpa;

    @Override
    public Optional<Compra> findById(Long id) {
        return jpa.findByIdWithFetch(id);
    }

    @Override
    public List<Compra> findAll() {
        return jpa.findAll();
    }

    @Override
    public List<Compra> findPaginado(String estado, int page, int size) {
        return jpa.findPaginado(normalizeEstado(estado), PageRequest.of(page, size));
    }

    @Override
    public long countPaginado(String estado) {
        return jpa.countPaginado(normalizeEstado(estado));
    }

    @Override
    public Compra save(Compra compra) {
        return jpa.save(compra);
    }

    private String normalizeEstado(String estado) {
        return (estado == null || estado.isBlank()) ? null : estado.trim().toLowerCase();
    }
}
