package com.bodega.domain.ports;

import com.bodega.domain.entities.Auditoria;

import java.time.Instant;
import java.util.List;

public interface AuditoriaRepository {
    List<Auditoria> buscar(String tabla, Instant desde, Instant hasta, int limit, int offset);
    long contar(String tabla, Instant desde, Instant hasta);
}
