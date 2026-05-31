package com.bodega.services.impl;

import com.bodega.core.exceptions.NegocioException;
import com.bodega.core.exceptions.ProductoNoEncontradoException;
import com.bodega.domain.entities.Producto;
import com.bodega.domain.ports.CategoriaRepository;
import com.bodega.domain.ports.ProductoRepository;
import com.bodega.domain.ports.ProductoService;
import com.bodega.domain.ports.UnidadMedidaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UnidadMedidaRepository unidadMedidaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Producto obtenerPorCodigoBarras(String codigoBarras) {
        return productoRepository.findByCodigoBarras(codigoBarras)
                .orElseThrow(() -> new ProductoNoEncontradoException(codigoBarras));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> stockBajo() {
        return productoRepository.findStockBajo();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarPaginado(String search, Long categoriaId, int page, int size) {
        return productoRepository.findPaginado(search, categoriaId, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPaginado(String search, Long categoriaId) {
        return productoRepository.countPaginado(search, categoriaId);
    }

    @Override
    @Transactional
    public Producto crear(Producto producto) {
        validarCategoria(producto);
        validarUnidadMedida(producto);
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto actualizar(Long id, Producto producto) {
        var existente = obtenerPorId(id);
        validarCategoria(producto);
        validarUnidadMedida(producto);
        producto.setIdProducto(id);
        producto.setCreadoEn(existente.getCreadoEn());
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        var producto = obtenerPorId(id);
        productoRepository.deleteById(producto.getIdProducto());
    }

    private void validarCategoria(Producto producto) {
        if (producto.getCategoria() != null && producto.getCategoria().getIdCategoria() != null) {
            categoriaRepository.findById(producto.getCategoria().getIdCategoria())
                    .orElseThrow(() -> new NegocioException("CATEGORIA_NO_ENCONTRADA",
                            "Categoría con id " + producto.getCategoria().getIdCategoria() + " no encontrada",
                            "Verifique que el id de categoría sea correcto"));
        }
    }

    private void validarUnidadMedida(Producto producto) {
        if (producto.getUnidadMedida() != null && producto.getUnidadMedida().getIdUm() != null) {
            unidadMedidaRepository.findById(producto.getUnidadMedida().getIdUm())
                    .orElseThrow(() -> new NegocioException("UNIDAD_MEDIDA_NO_ENCONTRADA",
                            "Unidad de medida con id " + producto.getUnidadMedida().getIdUm() + " no encontrada",
                            "Verifique que el id de unidad de medida sea correcto"));
        }
    }
}
