package com.bodega.repositories;

import com.bodega.domain.entities.TurnoCaja;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TurnoCajaJpaRepository extends JpaRepository<TurnoCaja, Long> {

    @Override
    @Query("SELECT t FROM TurnoCaja t JOIN FETCH t.caja JOIN FETCH t.usuario WHERE t.idTurno = :id")
    Optional<TurnoCaja> findById(@Param("id") Long id);

    @Query("SELECT t FROM TurnoCaja t JOIN FETCH t.caja JOIN FETCH t.usuario WHERE t.caja.idCaja = :idCaja AND t.usuario.idUsuario = :idUsuario AND t.estado = 'abierto'")
    Optional<TurnoCaja> findActivoPorCajaYUsuario(@Param("idCaja") Long idCaja, @Param("idUsuario") Long idUsuario);

    @Query("SELECT t FROM TurnoCaja t JOIN FETCH t.caja JOIN FETCH t.usuario WHERE t.usuario.idUsuario = :idUsuario AND t.estado = 'abierto'")
    Optional<TurnoCaja> findActivoPorUsuario(@Param("idUsuario") Long idUsuario);

    @Query("SELECT t FROM TurnoCaja t JOIN FETCH t.caja JOIN FETCH t.usuario WHERE t.caja.idCaja = :idCaja ORDER BY t.apertura DESC")
    List<TurnoCaja> findByCajaIdCajaOrderByAperturaDesc(@Param("idCaja") Long idCaja);

    @Query("SELECT t FROM TurnoCaja t JOIN FETCH t.caja JOIN FETCH t.usuario ORDER BY t.apertura DESC")
    List<TurnoCaja> findPaginado(Pageable pageable);

    @Query("SELECT COUNT(t) FROM TurnoCaja t")
    long countAll();
}
