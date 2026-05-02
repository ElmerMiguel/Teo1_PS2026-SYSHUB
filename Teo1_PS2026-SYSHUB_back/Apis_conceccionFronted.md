# API para Frontend — Syshub Backend

## Base URL, headers y autenticación

- Base URL: `http://localhost:3000/api`
- Para endpoints protegidos:
  - Header: `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Para upload de archivos: `multipart/form-data` con campo `file`.

## Respuesta estándar de errores

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

## Paginación

Las rutas paginadas responden:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

## Enumeraciones útiles

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
