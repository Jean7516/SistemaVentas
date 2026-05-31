package com.bodega.repositories;

import com.bodega.domain.entities.Venta;
import com.bodega.domain.ports.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class VentaRepositoryAdapter implements VentaRepository {

    private final VentaJpaRepository jpa;

    @Override
    public Optional<Venta> findById(Long id) {
        return jpa.findByIdWithFetch(id);
    }

    @Override
    public List<Venta> findByTurnoId(Long idTurno) {
        return jpa.findByTurnoWithFetch(idTurno);
    }

    @Override
    public List<Venta> findPaginado(Long idTurno, int page, int size) {
        return jpa.findPaginado(idTurno, PageRequest.of(page, size));
    }

    @Override
    public long countPaginado(Long idTurno) {
        return jpa.countPaginado(idTurno);
    }

    @Override
    public List<Venta> findByFecha(LocalDate fecha) {
        return jpa.findByFecha(fecha);
    }

    @Override
    public long countByFecha(LocalDate fecha) {
        return jpa.countByFecha(fecha);
    }

    @Override
    public Venta save(Venta venta) {
        return jpa.save(venta);
    }
}
