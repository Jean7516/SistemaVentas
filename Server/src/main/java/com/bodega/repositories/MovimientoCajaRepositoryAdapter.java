package com.bodega.repositories;

import com.bodega.domain.entities.MovimientoCaja;
import com.bodega.domain.ports.MovimientoCajaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MovimientoCajaRepositoryAdapter implements MovimientoCajaRepository {

    private final MovimientoCajaJpaRepository jpa;

    @Override
    public List<MovimientoCaja> findByTurnoId(Long idTurno) {
        return jpa.findByTurnoIdTurno(idTurno);
    }

    @Override
    public MovimientoCaja save(MovimientoCaja movimiento) {
        return jpa.save(movimiento);
    }
}
