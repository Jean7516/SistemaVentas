package com.bodega.repositories;

import com.bodega.domain.entities.Proveedor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProveedorJpaRepository extends JpaRepository<Proveedor, Long> {

    @Query(value = """
           SELECT p FROM Proveedor p
           WHERE (:pattern IS NULL
                  OR LOWER(p.razonSocial) LIKE :pattern
                  OR LOWER(p.ruc) LIKE :pattern
                  OR LOWER(p.contacto) LIKE :pattern)
           ORDER BY p.razonSocial ASC""")
    List<Proveedor> findPaginado(@Param("pattern") String pattern, Pageable pageable);

    @Query(value = """
           SELECT COUNT(p) FROM Proveedor p
           WHERE (:pattern IS NULL
                  OR LOWER(p.razonSocial) LIKE :pattern
                  OR LOWER(p.ruc) LIKE :pattern
                  OR LOWER(p.contacto) LIKE :pattern)""")
    long countPaginado(@Param("pattern") String pattern);
}
