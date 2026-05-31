package com.bodega.domain.ports;

import com.bodega.domain.entities.Caja;

import java.util.List;
import java.util.Optional;

public interface CajaRepository {
    List<Caja> findAll();
    Optional<Caja> findById(Long id);
    Caja save(Caja caja);
}
