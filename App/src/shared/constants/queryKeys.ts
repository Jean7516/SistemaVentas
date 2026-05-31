export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  productos: {
    all: ['productos'] as const,
    list: (params?: object) => ['productos', 'list', params] as const,
    detail: (id: number) => ['productos', 'detail', id] as const,
    barras: (codigo: string) => ['productos', 'barras', codigo] as const,
  },
  ventas: {
    all: ['ventas'] as const,
    list: (params?: object) => ['ventas', 'list', params] as const,
    detail: (id: number) => ['ventas', 'detail', id] as const,
  },
  compras: {
    all: ['compras'] as const,
    list: (params?: object) => ['compras', 'list', params] as const,
    detail: (id: number) => ['compras', 'detail', id] as const,
  },
  caja: {
    all: ['caja'] as const,
    turnos: (params?: object) => ['caja', 'turnos', params] as const,
    turnoDetail: (id: number) => ['caja', 'turnos', id] as const,
    movimientos: (turnoId: number) => ['caja', 'movimientos', turnoId] as const,
  },
  proveedores: {
    all: ['proveedores'] as const,
    list: (params?: object) => ['proveedores', 'list', params] as const,
  },
  categorias: {
    all: ['categorias'] as const,
  },
  unidadesMedida: {
    all: ['unidades-medida'] as const,
  },
  auditoria: {
    all: ['auditoria'] as const,
    list: (params?: object) => ['auditoria', 'list', params] as const,
  },
  reportes: {
    turno: (id: number) => ['reportes', 'turno', id] as const,
    turnos: ['reportes', 'turnos'] as const,
  },
  usuarios: {
    all: ['usuarios'] as const,
    list: (params?: object) => ['usuarios', 'list', params] as const,
  },
} as const;
