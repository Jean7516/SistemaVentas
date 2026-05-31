package com.bodega.domain.ports;

import com.bodega.domain.entities.TurnoCaja;

import java.util.List;
import java.util.Optional;

public interface TurnoCajaRepository {
    Optional<TurnoCaja> findById(Long id);
    Optional<TurnoCaja> findActivoPorCajaYUsuario(Long idCaja, Long idUsuario);
    Optional<TurnoCaja> findActivoPorUsuario(Long idUsuario);
    List<TurnoCaja> findHistorialPorCaja(Long idCaja);
    List<TurnoCaja> findPaginado(int page, int size);
    long countAll();
    TurnoCaja save(TurnoCaja turno);
}
