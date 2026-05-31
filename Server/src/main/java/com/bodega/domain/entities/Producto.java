package com.bodega.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "productos")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(name = "codigo_barras", unique = true, length = 30)
    private String codigoBarras;

    @Column(unique = true, length = 30)
    private String sku;

    @Column(nullable = false, length = 150)
    private String nombre;

    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_um", nullable = false)
    private UnidadMedida unidadMedida;

    @Column(name = "precio_venta", nullable = false, precision = 12, scale = 4)
    private BigDecimal precioVenta;

    @Column(name = "precio_costo", nullable = false, precision = 12, scale = 4)
    private BigDecimal precioCosto;

    @Column(name = "igv_incluido", nullable = false)
    private Boolean igvIncluido = true;

    @Column(name = "stock_actual", nullable = false, precision = 12, scale = 4)
    private BigDecimal stockActual = BigDecimal.ZERO;

    @Column(name = "stock_minimo", nullable = false, precision = 12, scale = 4)
    private BigDecimal stockMinimo = BigDecimal.ZERO;

    @Column(length = 30)
    private String ubicacion;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreatedDate
    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    @LastModifiedDate
    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn;
}
