# Sistema de Ventas e Inventario — Bodega / Tienda de Conveniencia

Sistema integral para la gestión de ventas (POS), inventario, compras, control de caja y auditoría de una bodega o tienda de conveniencia. Orientado a uso en red local (LAN) con PC de escritorio, teclado y lector de código de barras.

## Stack tecnológico

### Backend (`Server/`)
| Capa | Tecnología |
|---|---|
| Lenguaje | Java 21 |
| Framework | Spring Boot 3.3 |
| Seguridad | Spring Security + JWT |
| ORM | Spring Data JPA / Hibernate |
| BD | PostgreSQL 15+ |
| Migraciones | Flyway |
| Caché / Pub-Sub | Redis |
| API Docs | Springdoc OpenAPI (Swagger UI) |
| Build | Maven |
| Contenedores | Docker + Docker Compose |

### Frontend (`App/`)
| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript 5 (strict) |
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand v4 |
| Cliente HTTP | Axios |
| Formularios | React Hook Form + Zod |
| Tablas | TanStack Table v8 |
| Gráficos | Recharts |
| Estilos | Tailwind CSS 3 + shadcn/ui |
| Fechas | date-fns |

## Módulos del sistema

- **Autenticación y usuarios** — Login JWT, roles (admin, cajero, almacenero, supervisor)
- **Productos e inventario** — CRUD con código de barras, SKU, venta fraccionada (KG/LT), alertas de stock bajo
- **Ventas (POS)** — Punto de venta con carrito, múltiples métodos de pago, ticket secuencial, descuento por ítem, IGV 18%
- **Compras y proveedores** — Órdenes de compra, recepción con actualización automática de stock
- **Caja** — Turnos, apertura/cierre, movimientos manuales (ingreso/egreso/ajuste)
- **Reportes** — Dashboard con métricas del día, ventas por turno, productos más vendidos, stock bajo
- **Auditoría** — Trail inmutable de cambios con triggers en PostgreSQL y vista de historial por producto

## Requisitos

- Java 21+
- Node.js 20+
- PostgreSQL 15+
- Docker + Docker Compose (opcional)
- Maven 3.9+

## Inicio rápido

### 1. Base de datos

```bash
# Crear la base de datos
createdb bodega

# Ejecutar el schema (o usar Flyway automático al levantar el backend)
psql -d bodega -f bodega_schema.sql
```

### 2. Backend

```bash
cd Server
cp .env.example .env      # configurar credenciales de BD
./mvnw spring-boot:run    # o mvn spring-boot:run
```

La API estará en `http://localhost:8080/api/v1` y Swagger UI en `http://localhost:8080/swagger-ui.html`.

### 3. Frontend

```bash
cd App
cp .env.development .env
npm install
npm run dev
```

La app estará en `http://localhost:5173`.

### 4. Docker (todo junto)

```bash
cd Server
docker compose up -d
```

## Variables de entorno

### Backend (`.env`)
| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto PostgreSQL (default 5432) |
| `DB_NAME` | Nombre de base de datos |
| `DB_USER` | Usuario BD |
| `DB_PASS` | Contraseña BD |
| `JWT_SECRET` | Clave secreta para JWT |
| `JWT_EXPIRATION` | Tiempo de expiración del token |

### Frontend (`.env.development` / `.env.production`)
| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API backend |

## Esquema de base de datos

El archivo `bodega_schema.sql` contiene el esquema completo de PostgreSQL con:

- 11 tablas: usuarios, categorías, unidades_medida, productos, proveedores, compras, detalle_compras, cajas, turnos_caja, movimientos_caja, ventas, detalle_ventas, pagos_venta, auditoria
- Triggers para auditoría automática en tablas críticas (productos, ventas, turnos)
- Triggers para actualización de stock al recibir compras y al confirmar ventas
- Vistas útiles: `v_stock_bajo`, `v_resumen_turnos`, `v_auditoria_productos`
- Datos semilla (unidades de medida, categorías, cajas)

## Arquitectura del frontend

```
src/
├── app/               → Router, providers, layout
├── features/          → Módulos de negocio (auth, productos, ventas, caja, compras, reportes, auditoria)
├── shared/            → Componentes reutilizables, hooks, stores, tipos, constantes
└── assets/            → Recursos estáticos
```

Los features son autocontenidos e independientes entre sí. El código compartido vive en `shared/`.

## Licencia

Uso interno.
