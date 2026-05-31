package com.bodega.domain.ports;

import com.bodega.domain.entities.Venta;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VentaRepository {
    Optional<Venta> findById(Long id);
    List<Venta> findByTurnoId(Long idTurno);
    List<Venta> findPaginado(Long idTurno, int page, int size);
    long countPaginado(Long idTurno);
    List<Venta> findByFecha(LocalDate fecha);
    long countByFecha(LocalDate fecha);
    Venta save(Venta venta);
}
