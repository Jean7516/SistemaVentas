package com.bodega.core.exceptions;

public class ProductoNoEncontradoException extends BaseException {
    public ProductoNoEncontradoException(Long id) {
        super("PRODUCTO_NO_ENCONTRADO",
                "Producto con id " + id + " no encontrado",
                "Verifique que el id del producto sea correcto");
    }

    public ProductoNoEncontradoException(String codigoBarras) {
        super("PRODUCTO_NO_ENCONTRADO",
                "Producto con código de barras " + codigoBarras + " no encontrado",
                "Verifique que el código de barras sea correcto");
    }
}
