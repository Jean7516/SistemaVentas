package com.bodega.repositories;

import com.bodega.domain.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaJpaRepository extends JpaRepository<Categoria, Long> {
}
