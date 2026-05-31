package com.bodega.repositories;

import com.bodega.domain.entities.Usuario;
import com.bodega.domain.ports.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UsuarioRepositoryAdapter implements UsuarioRepository {

    private final UsuarioJpaRepository jpa;

    @Override
    public Optional<Usuario> findByUsername(String username) {
        return jpa.findByUsername(username);
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return jpa.existsByUsername(username);
    }

    @Override
    public List<Usuario> findPaginado(String search, int page, int size) {
        return jpa.findPaginado(toLikePattern(search), PageRequest.of(page, size));
    }

    @Override
    public long countPaginado(String search) {
        return jpa.countPaginado(toLikePattern(search));
    }

    @Override
    public Usuario save(Usuario usuario) {
        return jpa.save(usuario);
    }

    private String normalizeSearch(String search) {
        return (search == null || search.isBlank()) ? null : search.trim().toLowerCase();
    }

    private String toLikePattern(String search) {
        var normalized = normalizeSearch(search);
        return normalized != null ? "%" + normalized + "%" : null;
    }
}
