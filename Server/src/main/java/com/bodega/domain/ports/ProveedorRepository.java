package com.bodega.domain.ports;

import com.bodega.domain.entities.Proveedor;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository {
    List<Proveedor> findAll();
    List<Proveedor> findPaginado(String search, int page, int size);
    long countPaginado(String search);
    Optional<Proveedor> findById(Long id);
    Proveedor save(Proveedor proveedor);
    void deleteById(Long id);
}
