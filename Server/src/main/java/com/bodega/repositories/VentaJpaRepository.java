package com.bodega.repositories;

import com.bodega.domain.entities.Venta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VentaJpaRepository extends JpaRepository<Venta, Long> {

    @Query(value = """
           SELECT DISTINCT v FROM Venta v
           LEFT JOIN FETCH v.turno t
           LEFT JOIN FETCH t.caja
           LEFT JOIN FETCH t.usuario
           LEFT JOIN FETCH v.usuario
           LEFT JOIN FETCH v.detalles d
           LEFT JOIN FETCH d.producto
           LEFT JOIN FETCH v.pagos
           WHERE v.idVenta = :id""")
    Optional<Venta> findByIdWithFetch(@Param("id") Long id);

    @Query(value = """
           SELECT DISTINCT v FROM Venta v
           LEFT JOIN FETCH v.turno t
           LEFT JOIN FETCH t.caja
           LEFT JOIN FETCH t.usuario
           LEFT JOIN FETCH v.usuario
           LEFT JOIN FETCH v.detalles d
           LEFT JOIN FETCH d.producto
           LEFT JOIN FETCH v.pagos
           WHERE t.idTurno = :idTurno
           ORDER BY v.fechaHora DESC""")
    List<Venta> findByTurnoWithFetch(@Param("idTurno") Long idTurno);

    @Query(value = """
           SELECT DISTINCT v FROM Venta v
           LEFT JOIN FETCH v.turno t
           LEFT JOIN FETCH t.caja
           LEFT JOIN FETCH t.usuario
           LEFT JOIN FETCH v.usuario
           LEFT JOIN FETCH v.detalles d
           LEFT JOIN FETCH d.producto
           LEFT JOIN FETCH v.pagos
           WHERE (:idTurno IS NULL OR t.idTurno = :idTurno)
           ORDER BY v.fechaHora DESC""")
    List<Venta> findPaginado(@Param("idTurno") Long idTurno, Pageable pageable);

    @Query(value = """
           SELECT COUNT(DISTINCT v) FROM Venta v
           WHERE (:idTurno IS NULL OR v.turno.idTurno = :idTurno)""")
    long countPaginado(@Param("idTurno") Long idTurno);

    @Query("SELECT v FROM Venta v WHERE CAST(v.fechaHora AS LocalDate) = :fecha")
    List<Venta> findByFecha(@Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(v) FROM Venta v WHERE CAST(v.fechaHora AS LocalDate) = :fecha")
    long countByFecha(@Param("fecha") LocalDate fecha);
}
