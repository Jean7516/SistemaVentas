package com.bodega.repositories;

import com.bodega.domain.entities.Caja;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CajaJpaRepository extends JpaRepository<Caja, Long> {
}
