package com.bodega.domain.ports;

import com.bodega.domain.entities.MovimientoCaja;

import java.util.List;

public interface MovimientoCajaRepository {
    List<MovimientoCaja> findByTurnoId(Long idTurno);
    MovimientoCaja save(MovimientoCaja movimiento);
}
