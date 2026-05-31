package com.bodega.services.impl;

import com.bodega.core.exceptions.NegocioException;
import com.bodega.domain.entities.Caja;
import com.bodega.domain.entities.MovimientoCaja;
import com.bodega.domain.entities.TurnoCaja;
import com.bodega.domain.entities.Usuario;
import com.bodega.domain.enums.EstadoTurno;
import com.bodega.domain.enums.TipoMovimientoCaja;
import com.bodega.domain.ports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TurnoCajaServiceImpl implements TurnoCajaService {

    private final CajaRepository cajaRepository;
    private final TurnoCajaRepository turnoCajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public TurnoCaja abrirTurno(Long idCaja, BigDecimal montoApertura, String observaciones) {
        var caja = cajaRepository.findById(idCaja)
                .orElseThrow(() -> new NegocioException("CAJA_NO_ENCONTRADA",
                        "Caja con id " + idCaja + " no encontrada",
                        "Verifique que el id de caja sea correcto"));

        if (!caja.getActivo()) {
            throw new NegocioException("CAJA_INACTIVA",
                    "La caja '" + caja.getNombre() + "' está inactiva",
                    "No se puede abrir un turno en una caja inactiva");
        }

        var idUsuario = authService.obtenerIdUsuarioActual();

        var activo = turnoCajaRepository.findActivoPorCajaYUsuario(idCaja, idUsuario);
        if (activo.isPresent()) {
            throw new NegocioException("TURNO_YA_ACTIVO",
                    "Ya existe un turno abierto en esta caja para el usuario actual",
                    "Cierre el turno activo antes de abrir uno nuevo");
        }

        var turno = new TurnoCaja();
        var cajaRef = new Caja();
        cajaRef.setIdCaja(idCaja);
        turno.setCaja(cajaRef);
        var usuarioRef = new Usuario();
        usuarioRef.setIdUsuario(idUsuario);
        turno.setUsuario(usuarioRef);
        turno.setMontoApertura(montoApertura);
        turno.setObservaciones(observaciones);
        turno.setApertura(Instant.now());
        turno.setEstado(EstadoTurno.abierto);

        return turnoCajaRepository.save(turno);
    }

    @Override
    @Transactional
    public TurnoCaja cerrarTurno(Long idTurno, BigDecimal montoCierre, String observaciones) {
        var turno = turnoCajaRepository.findById(idTurno)
                .orElseThrow(() -> new NegocioException("TURNO_NO_ENCONTRADO",
                        "Turno con id " + idTurno + " no encontrado",
                        "Verifique que el id de turno sea correcto"));

        if (turno.getEstado() != EstadoTurno.abierto) {
            throw new NegocioException("TURNO_YA_CERRADO",
                    "El turno ya está cerrado",
                    "No se puede cerrar un turno que ya está cerrado");
        }

        turno.setMontoCierre(montoCierre);
        turno.setCierre(Instant.now());
        turno.setEstado(EstadoTurno.cerrado);
        turno.setObservaciones(observaciones);
        return turnoCajaRepository.save(turno);
    }

    @Override
    @Transactional
    public MovimientoCaja registrarMovimiento(Long idTurno, String tipo, BigDecimal monto, String descripcion, String referencia) {
        var turno = turnoCajaRepository.findById(idTurno)
                .orElseThrow(() -> new NegocioException("TURNO_NO_ENCONTRADO",
                        "Turno con id " + idTurno + " no encontrado",
                        "Verifique que el id de turno sea correcto"));

        if (turno.getEstado() != EstadoTurno.abierto) {
            throw new NegocioException("TURNO_NO_ACTIVO",
                    "El turno no está activo",
                    "Solo se pueden registrar movimientos en turnos abiertos");
        }

        var movimiento = new MovimientoCaja();
        movimiento.setTurno(turno);
        var usuarioRef = new Usuario();
        usuarioRef.setIdUsuario(authService.obtenerIdUsuarioActual());
        movimiento.setUsuario(usuarioRef);
        movimiento.setTipo(TipoMovimientoCaja.valueOf(tipo));
        movimiento.setMonto(monto);
        movimiento.setConcepto(descripcion);
        movimiento.setReferencia(referencia);
        movimiento.setFechaHora(Instant.now());

        return movimientoCajaRepository.save(movimiento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoCaja> listarMovimientos(Long idTurno) {
        return movimientoCajaRepository.findByTurnoId(idTurno);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoCaja> historialPorCaja(Long idCaja) {
        return turnoCajaRepository.findHistorialPorCaja(idCaja);
    }

    @Override
    @Transactional(readOnly = true)
    public TurnoCaja obtenerActivo() {
        var idUsuario = authService.obtenerIdUsuarioActual();
        return turnoCajaRepository.findActivoPorUsuario(idUsuario).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoCaja> listarPaginado(int page, int size) {
        return turnoCajaRepository.findPaginado(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPaginado() {
        return turnoCajaRepository.countAll();
    }
}
