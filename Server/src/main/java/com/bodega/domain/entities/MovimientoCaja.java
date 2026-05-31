package com.bodega.domain.entities;

import com.bodega.domain.enums.TipoMovimientoCaja;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "movimientos_caja")
@Getter
@Setter
public class MovimientoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno", nullable = false)
    private TurnoCaja turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TipoMovimientoCaja tipo;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal monto;

    @Column(nullable = false, length = 200)
    private String concepto;

    @Column(length = 60)
    private String referencia;

    @Column(name = "fecha_hora", nullable = false, updatable = false)
    private Instant fechaHora = Instant.now();
}
