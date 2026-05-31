package com.bodega.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cajas")
@Getter
@Setter
public class Caja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_caja")
    private Long idCaja;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    @Column(length = 120)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;
}
