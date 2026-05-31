package com.bodega.domain.ports;

import com.bodega.domain.entities.Categoria;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository {
    List<Categoria> findAll();
    Optional<Categoria> findById(Long id);
    Categoria save(Categoria categoria);
}
