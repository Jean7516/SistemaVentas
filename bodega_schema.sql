-- ============================================================
--  BODEGA / TIENDA DE CONVENIENCIA — Esquema PostgreSQL
--  Autor   : Jean
--  Motor   : PostgreSQL 15+
--  Módulos : Productos, Ventas, Compras, Caja, Auditoría
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  EXTENSIONES
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- para gen_random_uuid() si se necesita

-- ────────────────────────────────────────────────────────────
--  1. SEGURIDAD Y USUARIOS
-- ────────────────────────────────────────────────────────────
CREATE TABLE usuarios (
    id_usuario      SERIAL          PRIMARY KEY,
    nombre_completo VARCHAR(120)    NOT NULL,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    rol             VARCHAR(30)     NOT NULL CHECK (rol IN ('admin','cajero','almacenero','supervisor')),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  usuarios IS 'Cuentas del sistema. La contraseña se almacena como hash (bcrypt).';
COMMENT ON COLUMN usuarios.rol IS 'Perfil de acceso: admin, cajero, almacenero, supervisor.';

-- ────────────────────────────────────────────────────────────
--  2. CATÁLOGOS AUXILIARES
-- ────────────────────────────────────────────────────────────
CREATE TABLE unidades_medida (
    id_um           SERIAL          PRIMARY KEY,
    codigo          VARCHAR(10)     NOT NULL UNIQUE,   -- KG, UN, LT, MT…
    nombre          VARCHAR(50)     NOT NULL,
    es_fraccionable BOOLEAN         NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  unidades_medida IS 'Catálogo de unidades. es_fraccionable=TRUE permite decimales en cantidad.';
COMMENT ON COLUMN unidades_medida.codigo IS 'Ej: UN=Unidad, KG=Kilogramo, LT=Litro, MT=Metro.';

CREATE TABLE categorias (
    id_categoria    SERIAL          PRIMARY KEY,
    nombre          VARCHAR(80)     NOT NULL UNIQUE,
    descripcion     TEXT,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
--  3. PRODUCTOS E INVENTARIO
-- ────────────────────────────────────────────────────────────
CREATE TABLE productos (
    id_producto     SERIAL              PRIMARY KEY,
    codigo_barras   VARCHAR(30)         UNIQUE,         -- EAN-13 / QR / interno
    sku             VARCHAR(30)         UNIQUE,
    nombre          VARCHAR(150)        NOT NULL,
    descripcion     TEXT,
    id_categoria    INT                 NOT NULL REFERENCES categorias(id_categoria),
    id_um           INT                 NOT NULL REFERENCES unidades_medida(id_um),
    precio_venta    NUMERIC(12,4)       NOT NULL CHECK (precio_venta >= 0),
    precio_costo    NUMERIC(12,4)       NOT NULL CHECK (precio_costo >= 0),
    igv_incluido    BOOLEAN             NOT NULL DEFAULT TRUE,
    stock_actual    NUMERIC(12,4)       NOT NULL DEFAULT 0,
    stock_minimo    NUMERIC(12,4)       NOT NULL DEFAULT 0,
    ubicacion       VARCHAR(30),        -- pasillo/estante
    activo          BOOLEAN             NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  productos IS 'Maestro de productos. stock_actual soporta decimales para venta fraccionada.';
COMMENT ON COLUMN productos.precio_venta IS 'Precio de lista. Se congela en detalle_ventas al momento de la venta.';
COMMENT ON COLUMN productos.stock_actual IS 'NUMERIC(12,4) soporta fracciones de KG/LT/MT.';

CREATE INDEX idx_productos_barras   ON productos(codigo_barras);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_stock_bajo ON productos(stock_actual) WHERE stock_actual <= stock_minimo AND activo;

-- ────────────────────────────────────────────────────────────
--  4. PROVEEDORES Y COMPRAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE proveedores (
    id_proveedor    SERIAL          PRIMARY KEY,
    razon_social    VARCHAR(200)    NOT NULL,
    ruc             VARCHAR(20)     UNIQUE,
    contacto        VARCHAR(100),
    telefono        VARCHAR(20),
    email           VARCHAR(100),
    direccion       TEXT,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE compras (
    id_compra       SERIAL          PRIMARY KEY,
    id_proveedor    INT             NOT NULL REFERENCES proveedores(id_proveedor),
    id_usuario      INT             NOT NULL REFERENCES usuarios(id_usuario),
    numero_factura  VARCHAR(50),
    fecha_compra    DATE            NOT NULL DEFAULT CURRENT_DATE,
    fecha_registro  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    subtotal        NUMERIC(14,4)   NOT NULL DEFAULT 0,
    igv             NUMERIC(14,4)   NOT NULL DEFAULT 0,
    total           NUMERIC(14,4)   NOT NULL DEFAULT 0,
    estado          VARCHAR(20)     NOT NULL DEFAULT 'pendiente'
                                    CHECK (estado IN ('pendiente','recibida','anulada')),
    observaciones   TEXT
);

CREATE TABLE detalle_compras (
    id_detalle      SERIAL          PRIMARY KEY,
    id_compra       INT             NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
    id_producto     INT             NOT NULL REFERENCES productos(id_producto),
    cantidad        NUMERIC(12,4)   NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,4)   NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(14,4)   GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);
CREATE INDEX idx_detalle_compras_compra   ON detalle_compras(id_compra);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(id_producto);

-- ────────────────────────────────────────────────────────────
--  5. CONTROL DE CAJA
-- ────────────────────────────────────────────────────────────
CREATE TABLE cajas (
    id_caja         SERIAL          PRIMARY KEY,
    nombre          VARCHAR(60)     NOT NULL UNIQUE,    -- 'Caja 1', 'Caja Express'
    descripcion     VARCHAR(120),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE
);

CREATE TABLE turnos_caja (
    id_turno        SERIAL          PRIMARY KEY,
    id_caja         INT             NOT NULL REFERENCES cajas(id_caja),
    id_usuario      INT             NOT NULL REFERENCES usuarios(id_usuario),
    apertura        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    cierre          TIMESTAMPTZ,
    monto_apertura  NUMERIC(14,4)   NOT NULL DEFAULT 0,
    monto_cierre    NUMERIC(14,4),
    diferencia      NUMERIC(14,4)   GENERATED ALWAYS AS (
                        CASE WHEN monto_cierre IS NOT NULL
                             THEN monto_cierre - monto_apertura
                             ELSE NULL END
                    ) STORED,
    estado          VARCHAR(15)     NOT NULL DEFAULT 'abierto'
                                    CHECK (estado IN ('abierto','cerrado')),
    observaciones   TEXT,
    CONSTRAINT ck_cierre_despues_apertura CHECK (cierre IS NULL OR cierre > apertura)
);
CREATE INDEX idx_turnos_estado   ON turnos_caja(estado);
CREATE INDEX idx_turnos_usuario  ON turnos_caja(id_usuario);

CREATE TABLE movimientos_caja (
    id_movimiento   SERIAL          PRIMARY KEY,
    id_turno        INT             NOT NULL REFERENCES turnos_caja(id_turno),
    id_usuario      INT             NOT NULL REFERENCES usuarios(id_usuario),
    tipo            VARCHAR(15)     NOT NULL CHECK (tipo IN ('ingreso','egreso','ajuste')),
    monto           NUMERIC(14,4)   NOT NULL CHECK (monto > 0),
    concepto        VARCHAR(200)    NOT NULL,
    referencia      VARCHAR(60),     -- nro. de venta, factura, etc.
    fecha_hora      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_movimientos_turno ON movimientos_caja(id_turno);

-- ────────────────────────────────────────────────────────────
--  6. VENTAS (MAESTRO-DETALLE)
-- ────────────────────────────────────────────────────────────
CREATE TABLE ventas (
    id_venta        SERIAL          PRIMARY KEY,
    id_turno        INT             NOT NULL REFERENCES turnos_caja(id_turno),
    id_usuario      INT             NOT NULL REFERENCES usuarios(id_usuario),
    numero_ticket   VARCHAR(20)     NOT NULL UNIQUE,   -- ej: T-20240101-00001
    fecha_hora      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    cliente_nombre  VARCHAR(120),
    cliente_doc     VARCHAR(20),
    subtotal        NUMERIC(14,4)   NOT NULL DEFAULT 0,
    descuento_total NUMERIC(14,4)   NOT NULL DEFAULT 0,
    igv             NUMERIC(14,4)   NOT NULL DEFAULT 0,
    total           NUMERIC(14,4)   NOT NULL DEFAULT 0,
    estado          VARCHAR(15)     NOT NULL DEFAULT 'completada'
                                    CHECK (estado IN ('completada','anulada','pendiente')),
    motivo_anulacion TEXT
);
CREATE INDEX idx_ventas_fecha    ON ventas(fecha_hora DESC);
CREATE INDEX idx_ventas_turno    ON ventas(id_turno);
CREATE INDEX idx_ventas_ticket   ON ventas(numero_ticket);

CREATE TABLE detalle_ventas (
    id_detalle      SERIAL          PRIMARY KEY,
    id_venta        INT             NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_producto     INT             NOT NULL REFERENCES productos(id_producto),
    cantidad        NUMERIC(12,4)   NOT NULL CHECK (cantidad > 0),
    precio_hist     NUMERIC(12,4)   NOT NULL,  -- precio congelado al momento de venta
    costo_hist      NUMERIC(12,4)   NOT NULL,  -- costo congelado para margen
    descuento       NUMERIC(12,4)   NOT NULL DEFAULT 0,
    subtotal        NUMERIC(14,4)   GENERATED ALWAYS AS
                        ((cantidad * precio_hist) - descuento) STORED,
    CONSTRAINT ck_descuento_no_negativo CHECK (descuento >= 0),
    CONSTRAINT ck_descuento_menor_total CHECK (descuento <= cantidad * precio_hist)
);
CREATE INDEX idx_detalle_ventas_venta    ON detalle_ventas(id_venta);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(id_producto);

CREATE TABLE pagos_venta (
    id_pago         SERIAL          PRIMARY KEY,
    id_venta        INT             NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    metodo_pago     VARCHAR(20)     NOT NULL CHECK (metodo_pago IN
                                    ('efectivo','tarjeta_credito','tarjeta_debito',
                                     'transferencia','qr','yape','plin','otro')),
    monto           NUMERIC(14,4)   NOT NULL CHECK (monto > 0),
    referencia      VARCHAR(80),    -- nro. operación tarjeta / transferencia
    fecha_hora      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
--  7. MÓDULO DE AUDITORÍA (AUDIT TRAIL)
-- ────────────────────────────────────────────────────────────
CREATE TABLE auditoria (
    id_auditoria    BIGSERIAL       PRIMARY KEY,
    tabla_afectada  VARCHAR(60)     NOT NULL,
    pk_registro     BIGINT          NOT NULL,   -- PK del registro afectado
    accion          CHAR(6)         NOT NULL CHECK (accion IN ('INSERT','UPDATE','DELETE')),
    id_usuario      INT             REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha_hora      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ip_origen       INET,           -- útil si viene de backend
    datos_anteriores JSONB,         -- NULL en INSERT
    datos_nuevos     JSONB,         -- NULL en DELETE
    contexto         JSONB          -- metadata extra: módulo, sesión, etc.
);
-- Índices para consultas de auditoría frecuentes
CREATE INDEX idx_auditoria_tabla   ON auditoria(tabla_afectada, fecha_hora DESC);
CREATE INDEX idx_auditoria_usuario ON auditoria(id_usuario, fecha_hora DESC);
CREATE INDEX idx_auditoria_pk      ON auditoria(tabla_afectada, pk_registro);
CREATE INDEX idx_auditoria_fecha   ON auditoria(fecha_hora DESC);
-- Índice GIN para búsqueda dentro de los JSON de cambios
CREATE INDEX idx_auditoria_nuevo_gin  ON auditoria USING GIN (datos_nuevos);
CREATE INDEX idx_auditoria_viejo_gin  ON auditoria USING GIN (datos_anteriores);

COMMENT ON TABLE  auditoria IS 'Registro inmutable de todos los cambios en tablas críticas.';
COMMENT ON COLUMN auditoria.datos_anteriores IS 'Snapshot JSON de la fila ANTES del cambio (NULL en INSERT).';
COMMENT ON COLUMN auditoria.datos_nuevos     IS 'Snapshot JSON de la fila DESPUÉS del cambio (NULL en DELETE).';
COMMENT ON COLUMN auditoria.pk_registro      IS 'Valor de la PK del registro afectado para trazabilidad.';

-- ════════════════════════════════════════════════════════════
--  FUNCIÓN GENÉRICA DE AUDITORÍA (reutilizable con triggers)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_auditar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pk_col     TEXT;
    v_pk_valor   BIGINT;
    v_usuario_id INT;
    v_old_json   JSONB;
    v_new_json   JSONB;
BEGIN
    -- Intentar leer el id de usuario desde la configuración de sesión
    -- El backend debe ejecutar: SET LOCAL app.usuario_id = <id>
    BEGIN
        v_usuario_id := current_setting('app.usuario_id', TRUE)::INT;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    -- Obtener la PK del registro (asume columna llamada 'id_<tabla>')
    v_pk_col := 'id_' || REPLACE(TG_TABLE_NAME, 'detalle_', 'det_');

    IF TG_OP = 'DELETE' THEN
        v_old_json  := to_jsonb(OLD);
        v_new_json  := NULL;
        v_pk_valor  := (v_old_json ->> v_pk_col)::BIGINT;
    ELSIF TG_OP = 'INSERT' THEN
        v_old_json  := NULL;
        v_new_json  := to_jsonb(NEW);
        v_pk_valor  := (v_new_json ->> v_pk_col)::BIGINT;
    ELSE  -- UPDATE
        v_old_json  := to_jsonb(OLD);
        v_new_json  := to_jsonb(NEW);
        v_pk_valor  := (v_new_json ->> v_pk_col)::BIGINT;
        -- Optimización: solo registrar si hubo cambio real
        IF v_old_json = v_new_json THEN
            RETURN NEW;
        END IF;
    END IF;

    INSERT INTO auditoria (
        tabla_afectada,
        pk_registro,
        accion,
        id_usuario,
        datos_anteriores,
        datos_nuevos
    ) VALUES (
        TG_TABLE_NAME,
        v_pk_valor,
        TG_OP::CHAR(6),
        v_usuario_id,
        v_old_json,
        v_new_json
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION fn_auditar() IS
'Trigger genérico de auditoría. Registra INSERT/UPDATE/DELETE en la tabla auditoria.
 El backend debe inyectar el usuario con: SET LOCAL app.usuario_id = <id>;';

-- ════════════════════════════════════════════════════════════
--  TRIGGERS DE AUDITORÍA EN TABLAS CRÍTICAS
-- ════════════════════════════════════════════════════════════
CREATE TRIGGER trg_audit_productos
    AFTER INSERT OR UPDATE OR DELETE ON productos
    FOR EACH ROW EXECUTE FUNCTION fn_auditar();

CREATE TRIGGER trg_audit_ventas
    AFTER INSERT OR UPDATE OR DELETE ON ventas
    FOR EACH ROW EXECUTE FUNCTION fn_auditar();

CREATE TRIGGER trg_audit_detalle_ventas
    AFTER INSERT OR UPDATE OR DELETE ON detalle_ventas
    FOR EACH ROW EXECUTE FUNCTION fn_auditar();

CREATE TRIGGER trg_audit_turnos_caja
    AFTER INSERT OR UPDATE OR DELETE ON turnos_caja
    FOR EACH ROW EXECUTE FUNCTION fn_auditar();

-- ════════════════════════════════════════════════════════════
--  TRIGGER: actualizar stock al recibir una compra
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_actualizar_stock_compra()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Solo actualizar stock cuando la compra pasa a 'recibida'
    IF NEW.estado = 'recibida' AND (OLD.estado IS DISTINCT FROM 'recibida') THEN
        UPDATE productos p
        SET    stock_actual   = p.stock_actual + dc.cantidad,
               actualizado_en = NOW()
        FROM   detalle_compras dc
        WHERE  dc.id_compra   = NEW.id_compra
          AND  dc.id_producto = p.id_producto;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stock_compra
    AFTER UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_stock_compra();

-- ════════════════════════════════════════════════════════════
--  TRIGGER: descontar stock al confirmar una venta
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_descontar_stock_venta()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE productos
    SET    stock_actual   = stock_actual - NEW.cantidad,
           actualizado_en = NOW()
    WHERE  id_producto = NEW.id_producto;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stock_venta
    AFTER INSERT ON detalle_ventas
    FOR EACH ROW EXECUTE FUNCTION fn_descontar_stock_venta();

-- ════════════════════════════════════════════════════════════
--  DATOS INICIALES (seed)
-- ════════════════════════════════════════════════════════════
INSERT INTO unidades_medida (codigo, nombre, es_fraccionable) VALUES
    ('UN',  'Unidad',    FALSE),
    ('KG',  'Kilogramo', TRUE),
    ('LT',  'Litro',     TRUE),
    ('MT',  'Metro',     TRUE),
    ('DOC', 'Docena',    FALSE);

INSERT INTO categorias (nombre) VALUES
    ('Abarrotes'), ('Bebidas'), ('Lácteos'), ('Snacks'),
    ('Limpieza'), ('Cuidado personal'), ('Granos y Cereales');

INSERT INTO cajas (nombre) VALUES ('Caja 1'), ('Caja 2');

-- ════════════════════════════════════════════════════════════
--  VISTAS DE UTILIDAD
-- ════════════════════════════════════════════════════════════

-- Productos con stock bajo
CREATE OR REPLACE VIEW v_stock_bajo AS
    SELECT p.id_producto, p.codigo_barras, p.nombre,
           um.codigo AS unidad, p.stock_actual, p.stock_minimo,
           (p.stock_minimo - p.stock_actual) AS unidades_faltantes
    FROM   productos p
    JOIN   unidades_medida um ON um.id_um = p.id_um
    WHERE  p.activo AND p.stock_actual <= p.stock_minimo
    ORDER BY unidades_faltantes DESC;

-- Resumen de ventas por turno
CREATE OR REPLACE VIEW v_resumen_turnos AS
    SELECT t.id_turno, c.nombre AS caja, u.nombre_completo AS cajero,
           t.apertura, t.cierre, t.estado,
           t.monto_apertura, t.monto_cierre, t.diferencia,
           COUNT(v.id_venta)       AS num_ventas,
           SUM(v.total)            AS total_vendido
    FROM   turnos_caja t
    JOIN   cajas    c ON c.id_caja    = t.id_caja
    JOIN   usuarios u ON u.id_usuario = t.id_usuario
    LEFT JOIN ventas v ON v.id_turno  = t.id_turno
                      AND v.estado    = 'completada'
    GROUP BY t.id_turno, c.nombre, u.nombre_completo;

-- Historial de cambios legible de un producto
CREATE OR REPLACE VIEW v_auditoria_productos AS
    SELECT a.id_auditoria,
           a.pk_registro                             AS id_producto,
           a.accion,
           u.nombre_completo                         AS usuario,
           a.fecha_hora,
           a.datos_anteriores ->> 'nombre'           AS nombre_antes,
           a.datos_nuevos     ->> 'nombre'           AS nombre_despues,
           a.datos_anteriores ->> 'precio_venta'     AS precio_antes,
           a.datos_nuevos     ->> 'precio_venta'     AS precio_despues,
           a.datos_anteriores ->> 'stock_actual'     AS stock_antes,
           a.datos_nuevos     ->> 'stock_actual'     AS stock_despues
    FROM   auditoria a
    LEFT JOIN usuarios u ON u.id_usuario = a.id_usuario
    WHERE  a.tabla_afectada = 'productos'
    ORDER BY a.fecha_hora DESC;
