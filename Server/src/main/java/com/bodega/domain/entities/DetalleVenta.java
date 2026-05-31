package com.bodega.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_ventas")
@Getter
@Setter
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal cantidad;

    @Column(name = "precio_hist", nullable = false, precision = 12, scale = 4)
    private BigDecimal precioHist;

    @Column(name = "costo_hist", nullable = false, precision = 12, scale = 4)
    private BigDecimal costoHist;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(precision = 14, scale = 4, insertable = false, updatable = false)
    private BigDecimal subtotal;
}
