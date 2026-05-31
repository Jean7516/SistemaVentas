package com.bodega.domain.ports;

import com.bodega.domain.entities.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findById(Long id);
    boolean existsByUsername(String username);
    List<Usuario> findPaginado(String search, int page, int size);
    long countPaginado(String search);
    Usuario save(Usuario usuario);
}
