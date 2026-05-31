package com.bodega.repositories;

import com.bodega.domain.entities.Producto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoJpaRepository extends JpaRepository<Producto, Long> {

    @Override
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.unidadMedida ORDER BY p.creadoEn DESC")
    List<Producto> findAll();

    @Override
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.unidadMedida WHERE p.idProducto = :id")
    Optional<Producto> findById(@Param("id") Long id);

    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.unidadMedida WHERE p.codigoBarras = :codigo")
    Optional<Producto> findByCodigoBarras(@Param("codigo") String codigoBarras);

    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.unidadMedida WHERE p.activo = true AND p.stockActual <= p.stockMinimo")
    List<Producto> findStockBajo();

    @Query(value = """
           SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.unidadMedida
           WHERE p.activo = true
           AND (:pattern IS NULL OR LOWER(p.nombre) LIKE :pattern OR LOWER(p.codigoBarras) LIKE :pattern)
           AND (:categoriaId IS NULL OR p.categoria.idCategoria = :categoriaId)
           ORDER BY p.creadoEn DESC""")
    List<Producto> findPaginado(@Param("pattern") String pattern, @Param("categoriaId") Long categoriaId, Pageable pageable);

    @Query(value = """
           SELECT COUNT(p) FROM Producto p
           WHERE p.activo = true
           AND (:pattern IS NULL OR LOWER(p.nombre) LIKE :pattern OR LOWER(p.codigoBarras) LIKE :pattern)
           AND (:categoriaId IS NULL OR p.categoria.idCategoria = :categoriaId)""")
    long countPaginado(@Param("pattern") String pattern, @Param("categoriaId") Long categoriaId);
}
