package com.bodega.repositories;

import com.bodega.domain.entities.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface AuditoriaJpaRepository extends JpaRepository<Auditoria, Long> {

    @Query("SELECT a FROM Auditoria a WHERE " +
            "(:tabla IS NULL OR a.tablaAfectada = :tabla) AND " +
            "(:desde IS NULL OR a.fechaHora >= :desde) AND " +
            "(:hasta IS NULL OR a.fechaHora <= :hasta) " +
            "ORDER BY a.fechaHora DESC")
    List<Auditoria> buscar(
            @Param("tabla") String tabla,
            @Param("desde") Instant desde,
            @Param("hasta") Instant hasta);

    @Query("SELECT COUNT(a) FROM Auditoria a WHERE " +
            "(:tabla IS NULL OR a.tablaAfectada = :tabla) AND " +
            "(:desde IS NULL OR a.fechaHora >= :desde) AND " +
            "(:hasta IS NULL OR a.fechaHora <= :hasta)")
    long contar(
            @Param("tabla") String tabla,
            @Param("desde") Instant desde,
            @Param("hasta") Instant hasta);
}
