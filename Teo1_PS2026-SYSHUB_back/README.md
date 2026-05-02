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

-----
 **módulo C**.

### Estado actual (implementado)

El **Módulo C - Sección Social y Foros (Sys-Reddit)** está implementado en backend con:

- Hilos de discusión por categorías.
- Artículos/blogs con control de rol (`AUXILIAR` / `ADMIN`).
- Comentarios en hilos y artículos con soporte de respuestas anidadas.
- Sistema de valoraciones (`upvote` / `downvote`) en hilo/comentario/artículo.
- Ranking de comentarios en hilos por score.
- Reporte de contenido (hilo/comentario/proyecto).
- DTOs y serializers de respuesta para contratos consistentes.
- Pruebas unitarias y e2e del módulo.

### Endpoints del Módulo C (`/api/social`)

#### Hilos

- `POST /api/social/threads` (JWT)
- `GET /api/social/threads`
- `GET /api/social/threads/:idHilo`

#### Artículos

- `POST /api/social/articles` (JWT, AUXILIAR/ADMIN)
- `GET /api/social/articles`
- `GET /api/social/articles/:idArticulo`

#### Comentarios

- `POST /api/social/threads/:idHilo/comments` (JWT)
- `GET /api/social/threads/:idHilo/comments`
- `GET /api/social/threads/:idHilo/comments/ranked`
- `POST /api/social/articles/:idArticulo/comments` (JWT)
- `GET /api/social/articles/:idArticulo/comments`

#### Interacciones y reportes

- `POST /api/social/votes` (JWT)
- `POST /api/social/reports` (JWT)
- `GET /api/social/reports` (JWT, MODERADOR/ADMIN)
- `PATCH /api/social/reports/:idReporte/status` (JWT, MODERADOR/ADMIN)

### Guía rápida de payloads (Módulo C)

- Crear reporte de hilo:
  - `{ "razon": "spam", "descripcion": "contenido repetitivo", "idHilo": 15 }`
- Valorar comentario:
  - `{ "tipo": "upvote", "idComentario": 44 }`
- Modera reporte (resolver):
  - `PATCH /api/social/reports/9/status`
  - `{ "estado": "resuelto" }`
- Modera reporte (desestimar):
  - `PATCH /api/social/reports/9/status`
  - `{ "estado": "desestimado" }`

### Pruebas del Módulo C

- Unitarias:
  - `src/modules/social/services/social.service.spec.ts`
- E2E:
  - `test/social.e2e-spec.ts`

-----
 **módulo D**.

### Estado actual (implementado)

El **Módulo D - Panel de Administración y Moderación** está implementado en backend con:

- Gestión de usuarios (roles, activación y eliminación).
- Suspensiones con historial y cierre.
- CRUD de roles.
- Árbol jerárquico de categorías (pensum).
- Auditoría de acciones administrativas.
- Moderación avanzada con eliminación de contenido reportado.

### Endpoints del Módulo D (`/api/admin`)

#### Usuarios y suspensiones

- `GET /api/admin/users`
- `PATCH /api/admin/users/:idUsuario/active`
- `POST /api/admin/users/:idUsuario/roles`
- `DELETE /api/admin/users/:idUsuario/roles/:nombreRol`
- `DELETE /api/admin/users/:idUsuario`
- `GET /api/admin/users/:idUsuario/suspensions`
- `POST /api/admin/users/:idUsuario/suspensions`
- `PATCH /api/admin/users/:idUsuario/suspensions/:idSuspension/close`

#### Roles

- `GET /api/admin/roles`
- `POST /api/admin/roles`
- `PATCH /api/admin/roles/:idRol`
- `DELETE /api/admin/roles/:idRol`

#### Categorías

- `GET /api/admin/categories`
- `GET /api/admin/categories/tree`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:idCategoria`
- `DELETE /api/admin/categories/:idCategoria`

#### Moderación y auditoría

- `GET /api/admin/moderation/reports`
- `PATCH /api/admin/moderation/reports/:idReporte/status`
- `DELETE /api/admin/moderation/threads/:idHilo`
- `DELETE /api/admin/moderation/comments/:idComentario`
- `DELETE /api/admin/moderation/articles/:idArticulo`
- `DELETE /api/admin/moderation/projects/:idProyecto`
- `GET /api/admin/audit`

### Pruebas del Módulo D

- Unitarias:
  - `src/modules/admin/services/admin.service.spec.ts`
- E2E:
  - `test/admin.e2e-spec.ts`

-----
 **API para Frontend (contrato detallado)**

### Base URL, headers y autenticación

- Base URL: `http://localhost:3000/api`
- Para endpoints protegidos:
  - Header: `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Para upload de archivos: `multipart/form-data` con campo `file`.

### Respuesta estándar de errores

NestJS responde con formato:

```json
{
  "statusCode": 400,
  "message": ["descripcion"],
  "error": "Bad Request"
}
```

- En errores de validación, `message` es un arreglo.
- En errores de negocio, `message` suele ser string.

### Paginación

Las rutas paginadas responden:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

### Enumeraciones útiles

- `estado_proyecto`: `borrador | pendiente | publicado | archivado`
- `estado_hilo`: `abierto | cerrado | archivado`
- `estado_articulo`: `borrador | publicado | archivado`
- `estado_reporte`: `pendiente | resuelto | desestimado`
- `tipo_valoracion`: `upvote | downvote`
- `area_tecnica_cat`: `Desarrollo | IA | Infraestructura | Bases_de_Datos | Redes | Otro`

## Módulo A (Auth) — `/api/auth`

### Registro
`POST /api/auth/register`

**Body:**

```json
{
  "nombre": "Ana",
  "apellido": "Lopez",
  "email": "ana@correo.com",
  "password": "Secreta123",
  "carnet": "201900000",
  "semestre": 5
}
```

**Respuesta:**

```json
{
  "accessToken": "...",
  "user": {
    "idUsuario": 1,
    "nombre": "Ana",
    "apellido": "Lopez",
    "email": "ana@correo.com",
    "activo": true,
    "roles": ["ESTUDIANTE"]
  }
}
```

### Login
`POST /api/auth/login`

```json
{
  "email": "ana@correo.com",
  "password": "Secreta123"
}
```

### Perfil
- `GET /api/auth/me` (JWT)
- `PATCH /api/auth/me` (JWT)

**Body actualización:**

```json
{
  "nombre": "Ana",
  "apellido": "Lopez",
  "fotoPerfil": "https://...",
  "carnet": "201900000",
  "semestre": 6
}
```

## Módulo B (Proyectos) — `/api/projects`

### Crear proyecto
`POST /api/projects` (JWT)

```json
{
  "titulo": "Compilador X",
  "descripcion": "Proyecto final",
  "stackTecnologico": { "lenguajes": ["TS", "C"] },
  "idCategoria": 2,
  "etiquetas": ["Compiladores", "Lenguajes"]
}
```

### Actualizar proyecto
`PATCH /api/projects/:projectId` (JWT)

```json
{
  "titulo": "Compilador X v2",
  "estado": "pendiente"
}
```

### Subir archivo (multipart)
`POST /api/projects/:projectId/files/upload` (JWT)

- Campo: `file`
- Soporta `.pdf` y `.zip`
- Máximo: 50MB

### Registrar vista única
`POST /api/projects/:projectId/views` (JWT)

### Respuesta de proyecto (ejemplo)

```json
{
  "idProyecto": 1,
  "titulo": "Compilador X",
  "descripcion": "Proyecto final",
  "stackTecnologico": { "lenguajes": ["TS", "C"] },
  "estado": "borrador",
  "idUsuario": 1,
  "vistas": 2,
  "etiquetas": [{ "idEtiqueta": 1, "nombre": "Compiladores" }],
  "archivos": [
    {
      "idArchivo": 1,
      "nombreArchivo": "doc.pdf",
      "rutaArchivo": "uploads/projects/1/doc.pdf",
      "tipoMime": "application/pdf"
    }
  ]
}
```

## Módulo C (Social) — `/api/social`

### Crear hilo
`POST /api/social/threads` (JWT)

```json
{
  "titulo": "Duda de grafos",
  "contenido": "¿Cómo funciona Dijkstra?",
  "idCategoria": 3
}
```

### Crear artículo (AUXILIAR/ADMIN)
`POST /api/social/articles` (JWT)

```json
{
  "titulo": "Guía NestJS",
  "contenidoHtml": "<p>Contenido</p>",
  "resumen": "Guía",
  "estado": "publicado"
}
```

### Votar contenido
`POST /api/social/votes` (JWT)

```json
{ "tipo": "upvote", "idComentario": 44 }
```

### Reportar contenido
`POST /api/social/reports` (JWT)

```json
{ "razon": "spam", "idHilo": 15 }
```

## Módulo D (Admin) — `/api/admin`

### Suspensiones

- `POST /api/admin/users/:idUsuario/suspensions`

```json
{ "razon": "Incumplimiento de normas", "detalle": "Spam" }
```

- `PATCH /api/admin/users/:idUsuario/suspensions/:idSuspension/close`

```json
{ "notaCierre": "Tiempo cumplido" }
```

### Moderación de contenido

- `DELETE /api/admin/moderation/threads/:idHilo`
- `DELETE /api/admin/moderation/comments/:idComentario`
- `DELETE /api/admin/moderation/articles/:idArticulo`
- `DELETE /api/admin/moderation/projects/:idProyecto`

### Auditoría

- `GET /api/admin/audit`

**Respuesta:**

```json
{
  "items": [
    {
      "idAudit": 1,
      "accion": "DELETE_PROJECT",
      "entidad": "proyecto",
      "entidadId": 8,
      "fechaAccion": "2026-04-29T00:00:00.000Z",
      "idAdmin": 2
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```
 