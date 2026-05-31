-- ============================================================
--  SEED DATA — Sistema de Ventas e Inventario para Bodega
--  Datos de prueba para productos, proveedores, compras,
--  turnos y ventas.
--  Ejecutar después de que Flyway haya corrido V1 y V2.
-- ============================================================
--  USO: docker exec -i server-postgres-1 psql -U bodega_user -d bodega_db < src/main/resources/db/seed_data.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  1. PRODUCTOS
-- ────────────────────────────────────────────────────────────
INSERT INTO productos (codigo_barras, sku, nombre, descripcion, id_categoria, id_um, precio_venta, precio_costo, igv_incluido, stock_actual, stock_minimo, ubicacion) VALUES
('7750143001002', 'ARR-001', 'Arroz Costeño 1kg',       'Arroz extra superior',           1, 1,  4.50,  3.20, true,  50, 10, 'A-01'),
('7750143002009', 'AZU-001', 'Azúcar Rubia 1kg',        'Azúcar rubia doméstica',         1, 1,  3.80,  2.90, true,  40, 10, 'A-02'),
('7750228001457', 'ACE-001', 'Aceite Vegetal 1L',        'Aceite vegetal 100%',            1, 3,  9.50,  7.80, true,  30,  5, 'A-03'),
('7750143021007', 'FRE-001', 'Fideos Spaghetti 500g',    'Fideos tipo spaghetti',          1, 1,  2.20,  1.40, true,  70, 15, 'A-04'),
('7750143022004', 'LON-001', 'Lentejas 500g',            'Lentejas seleccionadas',         7, 1,  3.50,  2.30, true,  35, 10, 'G-01'),
('7750143023001', 'FRI-001', 'Frijol Canario 500g',      'Frijol canario seleccionado',    7, 1,  4.00,  2.80, true,  30, 10, 'G-02'),
('7750102003124', 'LEC-001', 'Leche Evaporada 400g',     'Leche evaporada entera',         3, 1,  3.20,  2.50, true,  60, 15, 'B-01'),
('7750102015004', 'YOG-001', 'Yogurt Natural 1kg',       'Yogurt natural batido',          3, 2,  8.00,  5.50, true,  20,  5, 'B-02'),
('7750228003123', 'GAS-001', 'Gaseosa Cola 1.5L',        'Bebida gaseosa sabor cola',      2, 3,  6.00,  4.20, true,  45, 10, 'C-01'),
('7750228004120', 'GAS-002', 'Gaseosa Limón 1.5L',       'Bebida gaseosa sabor limón',     2, 3,  6.00,  4.20, true,  35, 10, 'C-02'),
('7750228005127', 'AGU-001', 'Agua Mineral 500ml',        'Agua mineral sin gas',           2, 1,  1.50,  0.90, true, 200, 50, 'C-03'),
('7750143011001', 'GAL-001', 'Galletas Soda 250g',        'Galletas tipo soda',             4, 1,  2.50,  1.60, true, 100, 20, 'D-01'),
('7750143012008', 'GAL-002', 'Galletas Rellenas 200g',    'Galletas con crema',             4, 1,  3.00,  2.00, true,  80, 20, 'D-02'),
('7750102024003', 'DET-001', 'Detergente 500g',           'Detergente en polvo para ropa',  5, 1,  5.50,  4.00, true,  25,  5, 'E-01'),
('7750102025000', 'JAB-001', 'Jabón de Tocador',          'Jabón de tocador 100g',          6, 1,  1.80,  1.20, true, 150, 30, 'F-01')
ON CONFLICT (codigo_barras) DO NOTHING;

-- ────────────────────────────────────────────────────────────
--  2. PROVEEDORES
-- ────────────────────────────────────────────────────────────
INSERT INTO proveedores (razon_social, ruc, contacto, telefono, email, direccion) VALUES
('Distribuidora San Miguel S.A.C.',  '20100070971', 'Carlos López',  '999888111', 'carlos@sanmiguel.com',    'Av. Industrial 123, Lima'),
('Corporación Alimentaria S.A.',     '20100072099', 'María García',  '999888222', 'maria@corpalim.com',      'Jr. Comercio 456, Lima'),
('Bebidas del Perú S.A.C.',          '20450012345', 'Pedro Torres',  '999888333', 'pedro@bebidasperu.com',   'Calle Real 789, Ate'),
('Lácteos La Molina S.A.C.',         '20560023456', 'Ana Silva',     '999888444', 'ana@lacteoslamolina.com', 'Av. La Molina 321, Lima')
ON CONFLICT (ruc) DO NOTHING;

-- ────────────────────────────────────────────────────────────
--  3. COMPRA DE EJEMPLO (para probar recepción de compra)
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM compras WHERE numero_factura = 'F001-00001234') THEN
        INSERT INTO compras (id_proveedor, id_usuario, numero_factura, fecha_compra, estado, observaciones)
        VALUES (1, 1, 'F001-00001234', NOW(), 'pendiente', 'Compra inicial de prueba');

        INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario)
        SELECT c.id_compra, p.id_producto, dc.cantidad, dc.precio_unitario
        FROM   compras c
        CROSS JOIN (VALUES
            ('ARR-001', 50, 3.20),
            ('AZU-001', 40, 2.90),
            ('ACE-001', 30, 7.80),
            ('FRE-001', 60, 1.40),
            ('LEC-001', 80, 2.50)
        ) AS dc(sku, cantidad, precio_unitario)
        JOIN   productos p ON p.sku = dc.sku
        WHERE  c.numero_factura = 'F001-00001234';
    END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
--  4. RECIBIR COMPRA (actualiza stock vía trigger; idempotente)
-- ────────────────────────────────────────────────────────────
UPDATE compras SET estado = 'recibida'
WHERE numero_factura = 'F001-00001234' AND estado = 'pendiente';

-- ────────────────────────────────────────────────────────────
--  5. TURNO DE CAJA DE EJEMPLO
-- ────────────────────────────────────────────────────────────
INSERT INTO turnos_caja (id_caja, id_usuario, apertura, monto_apertura, estado)
SELECT 1, 1, NOW() - INTERVAL '1 hour', 500.00, 'abierto'
WHERE NOT EXISTS (SELECT 1 FROM turnos_caja WHERE id_caja = 1 AND id_usuario = 1 AND estado = 'abierto');
