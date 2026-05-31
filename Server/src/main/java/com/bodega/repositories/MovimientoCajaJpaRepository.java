package com.bodega.repositories;

import com.bodega.domain.entities.MovimientoCaja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoCajaJpaRepository extends JpaRepository<MovimientoCaja, Long> {
    List<MovimientoCaja> findByTurnoIdTurno(Long idTurno);
}
