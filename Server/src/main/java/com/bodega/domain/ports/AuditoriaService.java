package com.bodega.domain.ports;

import com.bodega.domain.entities.Auditoria;

import java.time.Instant;
import java.util.List;

public interface AuditoriaService {
    List<Auditoria> buscar(String tabla, Instant desde, Instant hasta, int page, int size);
}
