package com.bodega.repositories;

import com.bodega.domain.entities.Categoria;
import com.bodega.domain.ports.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CategoriaRepositoryAdapter implements CategoriaRepository {

    private final CategoriaJpaRepository jpa;

    @Override
    public List<Categoria> findAll() {
        return jpa.findAll();
    }

    @Override
    public Optional<Categoria> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Categoria save(Categoria categoria) {
        return jpa.save(categoria);
    }
}
