package com.bodega.domain.entities;

import com.bodega.domain.enums.MetodoPago;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pagos_venta")
@Getter
@Setter
public class PagoVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta", nullable = false)
    private Venta venta;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 20)
    private MetodoPago metodoPago;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal monto;

    @Column(length = 80)
    private String referencia;

    @Column(name = "fecha_hora", nullable = false, updatable = false)
    private Instant fechaHora = Instant.now();
}
