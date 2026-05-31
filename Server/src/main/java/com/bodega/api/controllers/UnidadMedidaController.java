package com.bodega.api.controllers;

import com.bodega.api.dtos.response.ApiResponse;
import com.bodega.domain.entities.UnidadMedida;
import com.bodega.domain.ports.UnidadMedidaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/unidades-medida")
@RequiredArgsConstructor
public class UnidadMedidaController {

    private final UnidadMedidaRepository unidadMedidaRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UnidadMedida>>> listar() {
        var unidades = unidadMedidaRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(unidades));
    }
}
