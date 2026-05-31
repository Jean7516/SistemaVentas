package com.bodega.domain.entities;

import com.bodega.domain.enums.EstadoTurno;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "turnos_caja")
@Getter
@Setter
public class TurnoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_turno")
    private Long idTurno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_caja", nullable = false)
    private Caja caja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, updatable = false)
    private Instant apertura;

    private Instant cierre;

    @Column(name = "monto_apertura", nullable = false, precision = 14, scale = 4)
    private BigDecimal montoApertura = BigDecimal.ZERO;

    @Column(name = "monto_cierre", precision = 14, scale = 4)
    private BigDecimal montoCierre;

    @Column(precision = 14, scale = 4, insertable = false, updatable = false)
    private BigDecimal diferencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private EstadoTurno estado = EstadoTurno.abierto;

    private String observaciones;
}
