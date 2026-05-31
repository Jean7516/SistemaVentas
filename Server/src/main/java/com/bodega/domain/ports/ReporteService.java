package com.bodega.domain.ports;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface ReporteService {
    ResumenTurno obtenerResumenTurno(Long idTurno);
    List<ResumenTurno> listarResumenTurnos();

    record ResumenTurno(
            Long idTurno,
            String caja,
            String cajero,
            Instant apertura,
            Instant cierre,
            String estado,
            BigDecimal montoApertura,
            BigDecimal montoCierre,
            BigDecimal diferencia,
            Long numVentas,
            BigDecimal totalVendido
    ) {}
}
