package com.bodega.infrastructure.security;

public final class AuditContext {

    private static final ThreadLocal<Long> USUARIO_ACTUAL = new ThreadLocal<>();

    private AuditContext() {}

    public static void setUsuarioId(Long id) {
        USUARIO_ACTUAL.set(id);
    }

    public static Long getUsuarioId() {
        return USUARIO_ACTUAL.get();
    }

    public static void limpiar() {
        USUARIO_ACTUAL.remove();
    }
}
