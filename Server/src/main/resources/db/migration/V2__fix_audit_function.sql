-- ============================================================
--  V2: Fix fn_auditar() — correct PK column name resolution
--  The original logic `'id_' || TG_TABLE_NAME` produces
--  plural column names (e.g. `id_productos`) but the actual
--  PK columns use singular names (`id_producto`).
--  Use an explicit mapping for all tables.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_auditar()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_pk_col     TEXT;
    v_pk_valor   BIGINT;
    v_usuario_id BIGINT;
    v_old_json   JSONB;
    v_new_json   JSONB;
BEGIN
    BEGIN
        v_usuario_id := current_setting('app.usuario_id', TRUE)::BIGINT;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    v_pk_col := CASE TG_TABLE_NAME
        WHEN 'productos'         THEN 'id_producto'
        WHEN 'ventas'            THEN 'id_venta'
        WHEN 'detalle_ventas'    THEN 'id_detalle'
        WHEN 'detalle_compras'   THEN 'id_detalle'
        WHEN 'turnos_caja'       THEN 'id_turno'
        WHEN 'unidades_medida'   THEN 'id_um'
        WHEN 'categorias'        THEN 'id_categoria'
        WHEN 'usuarios'          THEN 'id_usuario'
        WHEN 'compras'           THEN 'id_compra'
        WHEN 'proveedores'       THEN 'id_proveedor'
        WHEN 'cajas'             THEN 'id_caja'
        WHEN 'movimientos_caja'  THEN 'id_movimiento'
        WHEN 'pagos_venta'       THEN 'id_pago'
        WHEN 'auditoria'         THEN 'id_auditoria'
        ELSE 'id_' || TG_TABLE_NAME
    END;

    IF TG_OP = 'DELETE' THEN
        v_old_json  := to_jsonb(OLD);
        v_new_json  := NULL;
        v_pk_valor  := (v_old_json ->> v_pk_col)::BIGINT;
    ELSIF TG_OP = 'INSERT' THEN
        v_old_json  := NULL;
        v_new_json  := to_jsonb(NEW);
        v_pk_valor  := (v_new_json ->> v_pk_col)::BIGINT;
    ELSE
        v_old_json  := to_jsonb(OLD);
        v_new_json  := to_jsonb(NEW);
        v_pk_valor  := (v_new_json ->> v_pk_col)::BIGINT;
        IF v_old_json = v_new_json THEN
            RETURN NEW;
        END IF;
    END IF;

    INSERT INTO auditoria (
        tabla_afectada, pk_registro, accion, id_usuario,
        datos_anteriores, datos_nuevos
    ) VALUES (
        TG_TABLE_NAME, v_pk_valor, TG_OP::CHAR(6), v_usuario_id,
        v_old_json, v_new_json
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;
