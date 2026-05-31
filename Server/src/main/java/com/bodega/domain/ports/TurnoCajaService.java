package com.bodega.domain.ports;

import com.bodega.domain.entities.TurnoCaja;
import com.bodega.domain.entities.MovimientoCaja;

import java.math.BigDecimal;
import java.util.List;

public interface TurnoCajaService {
    TurnoCaja abrirTurno(Long idCaja, BigDecimal montoApertura, String observaciones);
    TurnoCaja cerrarTurno(Long idTurno, BigDecimal montoCierre, String observaciones);
    MovimientoCaja registrarMovimiento(Long idTurno, String tipo, BigDecimal monto, String descripcion, String referencia);
    List<MovimientoCaja> listarMovimientos(Long idTurno);
    List<TurnoCaja> historialPorCaja(Long idCaja);
    TurnoCaja obtenerActivo();
    List<TurnoCaja> listarPaginado(int page, int size);
    long contarPaginado();
}
