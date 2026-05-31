package com.bodega.core.exceptions;

public class StockInsuficienteException extends BaseException {
    public StockInsuficienteException(String producto, Double stockActual, Double solicitado) {
        super("STOCK_INSUFICIENTE",
                "Stock insuficiente para el producto '" + producto + "'",
                "Stock actual: " + stockActual + ", solicitado: " + solicitado);
    }
}
