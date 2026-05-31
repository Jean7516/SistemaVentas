package com.bodega.domain.ports;

import com.bodega.domain.entities.Compra;

import java.util.List;
import java.util.Optional;

public interface CompraRepository {
    Optional<Compra> findById(Long id);
    List<Compra> findAll();
    List<Compra> findPaginado(String estado, int page, int size);
    long countPaginado(String estado);
    Compra save(Compra compra);
}
