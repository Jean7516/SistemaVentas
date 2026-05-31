package com.bodega.domain.ports;

import com.bodega.domain.entities.UnidadMedida;

import java.util.List;
import java.util.Optional;

public interface UnidadMedidaRepository {
    List<UnidadMedida> findAll();
    Optional<UnidadMedida> findById(Long id);
}
