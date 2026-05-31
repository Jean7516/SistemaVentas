package com.bodega.repositories;

import com.bodega.domain.entities.Compra;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CompraJpaRepository extends JpaRepository<Compra, Long> {

    @Query(value = """
           SELECT DISTINCT c FROM Compra c
           LEFT JOIN FETCH c.proveedor
           LEFT JOIN FETCH c.usuario
           LEFT JOIN FETCH c.detalles d
           LEFT JOIN FETCH d.producto
           WHERE c.idCompra = :id""")
    Optional<Compra> findByIdWithFetch(@Param("id") Long id);

    @Query(value = """
           SELECT DISTINCT c FROM Compra c
           LEFT JOIN FETCH c.proveedor
           LEFT JOIN FETCH c.usuario
           LEFT JOIN FETCH c.detalles d
           LEFT JOIN FETCH d.producto
           WHERE (:estado IS NULL OR c.estado = :estado)
           ORDER BY c.fechaRegistro DESC""")
    List<Compra> findPaginado(@Param("estado") String estado, Pageable pageable);

    @Query(value = """
           SELECT COUNT(DISTINCT c) FROM Compra c
           WHERE (:estado IS NULL OR c.estado = :estado)""")
    long countPaginado(@Param("estado") String estado);
}
