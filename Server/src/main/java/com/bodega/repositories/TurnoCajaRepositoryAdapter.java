package com.bodega.repositories;

import com.bodega.domain.entities.TurnoCaja;
import com.bodega.domain.ports.TurnoCajaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TurnoCajaRepositoryAdapter implements TurnoCajaRepository {

    private final TurnoCajaJpaRepository jpa;

    @Override
    public Optional<TurnoCaja> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<TurnoCaja> findActivoPorCajaYUsuario(Long idCaja, Long idUsuario) {
        return jpa.findActivoPorCajaYUsuario(idCaja, idUsuario);
    }

    @Override
    public Optional<TurnoCaja> findActivoPorUsuario(Long idUsuario) {
        return jpa.findActivoPorUsuario(idUsuario);
    }

    @Override
    public List<TurnoCaja> findHistorialPorCaja(Long idCaja) {
        return jpa.findByCajaIdCajaOrderByAperturaDesc(idCaja);
    }

    @Override
    public List<TurnoCaja> findPaginado(int page, int size) {
        return jpa.findPaginado(PageRequest.of(page, size));
    }

    @Override
    public long countAll() {
        return jpa.countAll();
    }

    @Override
    public TurnoCaja save(TurnoCaja turno) {
        return jpa.save(turno);
    }
}
