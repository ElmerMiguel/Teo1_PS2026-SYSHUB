# Syshub Backend (NestJS + PostgreSQL)

Backend oficial de **Syshub**, alineado a los requerimientos de Fase 2 y al modelo de datos definido en `db/DB_Syshub.sql`.

## Estado actual del backend

Base inicial lista para trabajar por módulos:

- NestJS 11 configurado con prefijo global `api`
- Configuración centralizada de entorno (`@nestjs/config`)
- TypeORM con PostgreSQL
- Migración inicial con el esquema completo de Syshub
- Módulos base separados por dominio:
  - `identity`
  - `projects`
  - `social`
  - `admin`
- Endpoint de salud: `GET /api/health`

## Requisitos

- Node.js 20+
- PostgreSQL 14+

## Configuración rápida

1. Instalar dependencias

```bash
npm install
```

2. Crear archivo de entorno

```bash
cp .env.example .env
```

3. Ajustar credenciales de PostgreSQL en `.env`

4. Ejecutar migraciones

```bash
npm run db:migration:run
```

5. Levantar servidor en desarrollo

```bash
npm run start:dev
```

## Scripts principales

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
npm run lint
```

### Migraciones

```bash
npm run db:migration:create
npm run db:migration:generate
npm run db:migration:run
npm run db:migration:revert
```

## Arquitectura inicial

```
src/
  config/
    env.validation.ts
  database/
    data-source.ts
    typeorm.config.ts
    migrations/
  health/
  modules/
    identity/
    projects/
    social/
    admin/
```

## Próximos pasos (paso a paso)

1. **Módulo A - Identidad y perfiles**
   - entidades (`USUARIO`, `ROL`, `USUARIO_ROL`, `SESION`)
   - auth JWT + refresh
   - registro/login/recover

2. **Módulo B - Proyectos**
   - CRUD de `PROYECTO`
   - subida de archivos (`ARCHIVO_PROYECTO`)
   - tags + curaduría

3. **Módulo C - Social (Sys-Reddit)**
   - hilos, comentarios anidados
   - votos y ordenamiento por relevancia
   - artículos/blog

4. **Módulo D - Admin/Moderación**
   - gestión de usuarios/roles
   - categorías y pensum
   - reportes y sanciones

---
 **módulo A (auth + perfiles)**.


-----
 **módulo B**.

### Estado actual (implementado)

El **Módulo B - Repositorio de Proyectos y Tareas** está implementado en backend con:

- CRUD base de proyectos.
- Carga de adjuntos por metadata y subida real de archivos (disco local).
- Gestión de etiquetas (tags) y categorías.
- Curaduría de proyectos por rol (`AUXILIAR` / `ADMIN`).
- Búsqueda y paginación.
- DTOs + serializers de respuesta para contratos consistentes de API.
- Pruebas unitarias y e2e del módulo.

### Endpoints del Módulo B (`/api/projects`)

#### Proyectos

- `POST /api/projects` (JWT)
  - Crea proyecto en estado inicial (no permite crear directo en `publicado`).
- `GET /api/projects`
  - Lista proyectos.
- `GET /api/projects/me/list` (JWT)
  - Lista proyectos del usuario autenticado.
- `GET /api/projects/:projectId`
  - Obtiene detalle de proyecto.
- `PATCH /api/projects/:projectId` (JWT)
  - Actualiza proyecto (owner/admin).
- `DELETE /api/projects/:projectId` (JWT)
  - Elimina proyecto y sus adjuntos asociados.

#### Archivos de proyecto

- `POST /api/projects/:projectId/files` (JWT)
  - Agrega metadata de archivo en `ARCHIVO_PROYECTO`.
- `POST /api/projects/:projectId/files/upload` (JWT, multipart)
  - Sube archivo real al disco (`uploads/projects/:projectId`) y registra metadata.
  - Restricciones: solo `.PDF` o `.ZIP`, máximo `50MB`.
- `GET /api/projects/:projectId/files/:fileId/download` (JWT)
  - Descarga archivo con validación de permisos.
- `DELETE /api/projects/:projectId/files/:fileId` (JWT)
  - Elimina metadata y archivo físico (si existe).

#### Curaduría, búsqueda y catálogos

- `POST /api/projects/:projectId/curate` (JWT, AUXILIAR/ADMIN)
  - Marca/actualiza curaduría de proyecto.
- `GET /api/projects/curated`
  - Lista proyectos curados activos.
- `GET /api/projects/tags`
  - Lista etiquetas disponibles.
- `GET /api/projects/categories`
  - Lista categorías disponibles.
- `GET /api/projects/search?tag=&categoryId=&q=&page=&limit=`
  - Búsqueda por filtros con paginación.
- `POST /api/projects/:projectId/views` (JWT)
  - Registra vista única por usuario para proyectos publicados.

### Reglas de negocio implementadas

- Para publicar (`estado = publicado`) se exige:
  - descripción,
  - stack tecnológico,
  - al menos 1 etiqueta,
  - al menos 1 archivo adjunto.
- Curaduría restringida a roles `AUXILIAR` o `ADMIN`.
- Modificación/eliminación de proyecto restringida a owner o `ADMIN`.
- Descarga de archivo:
  - permitida al owner,
  - permitida a `ADMIN`,
  - permitida a terceros solo si el proyecto está `publicado`.
- Vistas:
  - solo cuentan en proyectos `publicado`,
  - se incrementa una sola vez por usuario autenticado.

### Pruebas del Módulo B

- Unitarias:
  - `src/modules/projects/services/projects.service.spec.ts`
- E2E:
  - `test/projects.e2e-spec.ts`

Incluidas en la ejecución estándar:

```bash
npm run test
npm run test:e2e
```
 