package com.bodega.services.impl;

import com.bodega.core.exceptions.NegocioException;
import com.bodega.domain.entities.TurnoCaja;
import com.bodega.domain.ports.ReporteService;
import com.bodega.domain.ports.TurnoCajaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements ReporteService {

    private final TurnoCajaRepository turnoCajaRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public ResumenTurno obtenerResumenTurno(Long idTurno) {
        var turno = turnoCajaRepository.findById(idTurno)
                .orElseThrow(() -> new NegocioException("TURNO_NO_ENCONTRADO",
                        "Turno con id " + idTurno + " no encontrado", ""));

        var query = entityManager.createNativeQuery("""
                SELECT COALESCE(COUNT(v.id_venta), 0) AS num_ventas,
                       COALESCE(SUM(v.total), 0) AS total_vendido
                FROM ventas v
                WHERE v.id_turno = :idTurno AND v.estado = 'completada'
                """, Tuple.class);
        query.setParameter("idTurno", idTurno);
        var row = (Tuple) query.getSingleResult();

        return new ResumenTurno(
                turno.getIdTurno(),
                turno.getCaja().getNombre(),
                turno.getUsuario().getNombreCompleto(),
                turno.getApertura(),
                turno.getCierre(),
                turno.getEstado().name(),
                turno.getMontoApertura(),
                turno.getMontoCierre(),
                turno.getDiferencia(),
                ((Number) row.get("num_ventas")).longValue(),
                (java.math.BigDecimal) row.get("total_vendido")
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenTurno> listarResumenTurnos() {
        var query = entityManager.createNativeQuery("""
                SELECT t.id_turno, c.nombre AS caja, u.nombre_completo AS cajero,
                       t.apertura, t.cierre, t.estado,
                       t.monto_apertura, t.monto_cierre, t.diferencia,
                       COALESCE(COUNT(v.id_venta), 0) AS num_ventas,
                       COALESCE(SUM(v.total), 0) AS total_vendido
                FROM turnos_caja t
                JOIN cajas c ON c.id_caja = t.id_caja
                JOIN usuarios u ON u.id_usuario = t.id_usuario
                LEFT JOIN ventas v ON v.id_turno = t.id_turno AND v.estado = 'completada'
                GROUP BY t.id_turno, c.nombre, u.nombre_completo,
                         t.apertura, t.cierre, t.estado,
                         t.monto_apertura, t.monto_cierre, t.diferencia
                ORDER BY t.apertura DESC
                """, Tuple.class);

        return query.getResultList().stream().map(row -> {
            var t = (Tuple) row;
            return new ResumenTurno(
                    ((Number) t.get("id_turno")).longValue(),
                    (String) t.get("caja"),
                    (String) t.get("cajero"),
                    t.get("apertura", java.time.Instant.class),
                    t.get("cierre", java.time.Instant.class),
                    (String) t.get("estado"),
                    (java.math.BigDecimal) t.get("monto_apertura"),
                    (java.math.BigDecimal) t.get("monto_cierre"),
                    (java.math.BigDecimal) t.get("diferencia"),
                    ((Number) t.get("num_ventas")).longValue(),
                    (java.math.BigDecimal) t.get("total_vendido")
            );
        }).toList();
    }
}
