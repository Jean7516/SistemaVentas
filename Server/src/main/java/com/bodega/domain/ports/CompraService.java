package com.bodega.domain.ports;

import com.bodega.domain.entities.Compra;
import com.bodega.domain.entities.Proveedor;

import java.util.List;

public interface CompraService {
    // --- Proveedores ---
    List<Proveedor> proveedorListarPaginado(String search, int page, int size);
    long proveedorContarPaginado(String search);
    Proveedor obtenerProveedor(Long id);
    List<Proveedor> listarProveedores();
    Proveedor crearProveedor(Proveedor proveedor);
    Proveedor actualizarProveedor(Long id, Proveedor proveedor);
    void eliminarProveedor(Long id);

    // --- Compras ---
    Compra crearCompra(Long idProveedor, String numeroFactura, String observaciones,
                       List<ItemCompraInput> items);
    Compra recibirCompra(Long idCompra);
    List<Compra> listarCompras();
    List<Compra> listarPaginado(String estado, int page, int size);
    long contarPaginado(String estado);
    Compra obtenerCompra(Long id);

    record ItemCompraInput(Long idProducto, java.math.BigDecimal cantidad, java.math.BigDecimal precioUnitario) {}
}
