package com.bodega.repositories;

import com.bodega.domain.entities.Usuario;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioJpaRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    boolean existsByUsername(String username);

    @Query(value = """
           SELECT u FROM Usuario u
           WHERE (:pattern IS NULL
                  OR LOWER(u.nombreCompleto) LIKE :pattern
                  OR LOWER(u.username) LIKE :pattern)
           ORDER BY u.nombreCompleto ASC""")
    List<Usuario> findPaginado(@Param("pattern") String pattern, Pageable pageable);

    @Query(value = """
           SELECT COUNT(u) FROM Usuario u
           WHERE (:pattern IS NULL
                  OR LOWER(u.nombreCompleto) LIKE :pattern
                  OR LOWER(u.username) LIKE :pattern)""")
    long countPaginado(@Param("pattern") String pattern);
}
