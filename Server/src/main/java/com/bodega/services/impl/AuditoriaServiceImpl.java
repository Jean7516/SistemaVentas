package com.bodega.services.impl;

import com.bodega.domain.entities.Auditoria;
import com.bodega.domain.ports.AuditoriaRepository;
import com.bodega.domain.ports.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {

    private static final int PAGE_SIZE = 20;

    private final AuditoriaRepository auditoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Auditoria> buscar(String tabla, Instant desde, Instant hasta, int page, int size) {
        var limit = size > 0 ? size : PAGE_SIZE;
        var offset = (long) page * limit;
        return auditoriaRepository.buscar(tabla, desde, hasta, (int) limit, (int) offset);
    }
}
