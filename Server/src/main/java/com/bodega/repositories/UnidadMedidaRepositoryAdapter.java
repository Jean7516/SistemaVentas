package com.bodega.repositories;

import com.bodega.domain.entities.UnidadMedida;
import com.bodega.domain.ports.UnidadMedidaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UnidadMedidaRepositoryAdapter implements UnidadMedidaRepository {

    private final UnidadMedidaJpaRepository jpa;

    @Override
    public List<UnidadMedida> findAll() {
        return jpa.findAll();
    }

    @Override
    public Optional<UnidadMedida> findById(Long id) {
        return jpa.findById(id);
    }
}
