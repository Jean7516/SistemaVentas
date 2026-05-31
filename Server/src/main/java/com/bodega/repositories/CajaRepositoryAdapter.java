package com.bodega.repositories;

import com.bodega.domain.entities.Caja;
import com.bodega.domain.ports.CajaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CajaRepositoryAdapter implements CajaRepository {

    private final CajaJpaRepository jpa;

    @Override
    public List<Caja> findAll() {
        return jpa.findAll();
    }

    @Override
    public Optional<Caja> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Caja save(Caja caja) {
        return jpa.save(caja);
    }
}
