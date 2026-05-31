package com.bodega.services.impl;

import com.bodega.core.exceptions.NegocioException;
import com.bodega.domain.entities.*;
import static com.bodega.domain.enums.EstadoCompra.pendiente;
import static com.bodega.domain.enums.EstadoCompra.recibida;
import com.bodega.domain.ports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {

    private static final BigDecimal IGV_TASA = new BigDecimal("0.18");

    private final ProveedorRepository proveedorRepository;
    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;

    // ========== Proveedores ==========

    @Override
    @Transactional(readOnly = true)
    public List<Proveedor> proveedorListarPaginado(String search, int page, int size) {
        return proveedorRepository.findPaginado(search, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long proveedorContarPaginado(String search) {
        return proveedorRepository.countPaginado(search);
    }

    @Override
    @Transactional(readOnly = true)
    public Proveedor obtenerProveedor(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new NegocioException("PROVEEDOR_NO_ENCONTRADO",
                        "Proveedor con id " + id + " no encontrado", ""));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    @Override
    @Transactional
    public Proveedor crearProveedor(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    @Override
    @Transactional
    public Proveedor actualizarProveedor(Long id, Proveedor proveedor) {
        var existente = proveedorRepository.findById(id)
                .orElseThrow(() -> new NegocioException("PROVEEDOR_NO_ENCONTRADO",
                        "Proveedor con id " + id + " no encontrado", ""));
        proveedor.setIdProveedor(id);
        proveedor.setCreadoEn(existente.getCreadoEn());
        return proveedorRepository.save(proveedor);
    }

    @Override
    @Transactional
    public void eliminarProveedor(Long id) {
        proveedorRepository.findById(id)
                .orElseThrow(() -> new NegocioException("PROVEEDOR_NO_ENCONTRADO",
                        "Proveedor con id " + id + " no encontrado", ""));
        proveedorRepository.deleteById(id);
    }

    // ========== Compras ==========

    @Override
    @Transactional
    public Compra crearCompra(Long idProveedor, String numeroFactura, String observaciones,
                              List<ItemCompraInput> items) {
        var proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new NegocioException("PROVEEDOR_NO_ENCONTRADO",
                        "Proveedor con id " + idProveedor + " no encontrado", ""));

        var compra = new Compra();
        compra.setProveedor(proveedor);
        var usuario = usuarioRepository.findById(authService.obtenerIdUsuarioActual())
                .orElseThrow(() -> new NegocioException("USUARIO_NO_ENCONTRADO",
                        "Usuario actual no encontrado", ""));
        compra.setUsuario(usuario);
        compra.setNumeroFactura(numeroFactura);
        compra.setFechaCompra(LocalDate.now());
        compra.setFechaRegistro(Instant.now());
        compra.setObservaciones(observaciones);
        compra.setEstado(pendiente);

        for (var item : items) {
            var producto = productoRepository.findById(item.idProducto())
                    .orElseThrow(() -> new NegocioException("PRODUCTO_NO_ENCONTRADO",
                            "Producto con id " + item.idProducto() + " no encontrado", ""));

            var itemSubtotal = item.cantidad().multiply(item.precioUnitario());

            var detalle = new DetalleCompra();
            detalle.setCompra(compra);
            detalle.setProducto(producto);
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioUnitario(item.precioUnitario());
            compra.getDetalles().add(detalle);

            compra.setSubtotal(compra.getSubtotal().add(itemSubtotal));
        }

        compra.setIgv(compra.getSubtotal().multiply(IGV_TASA).setScale(4, RoundingMode.HALF_UP));
        compra.setTotal(compra.getSubtotal().add(compra.getIgv()).setScale(4, RoundingMode.HALF_UP));
        compra.setSubtotal(compra.getSubtotal().setScale(4, RoundingMode.HALF_UP));

        return compraRepository.save(compra);
    }

    @Override
    @Transactional
    public Compra recibirCompra(Long idCompra) {
        var compra = compraRepository.findById(idCompra)
                .orElseThrow(() -> new NegocioException("COMPRA_NO_ENCONTRADA",
                        "Compra con id " + idCompra + " no encontrada", ""));

        if (compra.getEstado() != pendiente) {
            throw new NegocioException("COMPRA_NO_RECEPCIONABLE",
                    "La compra no puede ser recibida porque su estado es " + compra.getEstado(),
                    "Solo se pueden recibir compras en estado pendiente");
        }

        compra.setEstado(recibida);

        for (var detalle : compra.getDetalles()) {
            var producto = detalle.getProducto();
            producto.setStockActual(producto.getStockActual().add(detalle.getCantidad()));
            producto.setPrecioCosto(detalle.getPrecioUnitario());
            productoRepository.save(producto);
        }

        return compraRepository.save(compra);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Compra> listarCompras() {
        return compraRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Compra> listarPaginado(String estado, int page, int size) {
        return compraRepository.findPaginado(estado, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPaginado(String estado) {
        return compraRepository.countPaginado(estado);
    }

    @Override
    @Transactional(readOnly = true)
    public Compra obtenerCompra(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new NegocioException("COMPRA_NO_ENCONTRADA",
                        "Compra con id " + id + " no encontrada", ""));
    }
}
