# API Syshub — Comandos curl

> Base URL: `http://localhost:3000/api`
> 
> Reemplaza:
> - `<TOKEN>` por tu JWT
> - `<ID>` por IDs reales

## Salud

```bash
curl -X GET "http://localhost:3000/api/health"
```

## Módulo A — Auth (`/api/auth`)

### Registro

```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "Lopez",
    "email": "ana@correo.com",
    "password": "Secreta123",
    "carnet": "201900000",
    "semestre": 5
  }'
```

### Login

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@correo.com",
    "password": "Secreta123"
  }'
```

### Perfil (ver)

```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer <TOKEN>"
```

### Perfil (actualizar)

```bash
curl -X PATCH "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "Lopez",
    "fotoPerfil": "https://example.com/avatar.png",
    "carnet": "201900000",
    "semestre": 6
  }'
```

## Módulo B — Proyectos (`/api/projects`)

### Crear proyecto

```bash
curl -X POST "http://localhost:3000/api/projects" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Compilador X",
    "descripcion": "Proyecto final",
    "stackTecnologico": { "lenguajes": ["TS", "C"] },
    "idCategoria": 2,
    "etiquetas": ["Compiladores", "Lenguajes"]
  }'
```

### Listar proyectos

```bash
curl -X GET "http://localhost:3000/api/projects"
```

### Listar proyectos del usuario

```bash
curl -X GET "http://localhost:3000/api/projects/me/list" \
  -H "Authorization: Bearer <TOKEN>"
```

### Obtener proyecto

```bash
curl -X GET "http://localhost:3000/api/projects/<ID>"
```

### Actualizar proyecto

```bash
curl -X PATCH "http://localhost:3000/api/projects/<ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Compilador X v2",
    "estado": "pendiente"
  }'
```

### Eliminar proyecto

```bash
curl -X DELETE "http://localhost:3000/api/projects/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Agregar archivo (metadata)

```bash
curl -X POST "http://localhost:3000/api/projects/<ID>/files" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreArchivo": "doc.pdf",
    "rutaArchivo": "uploads/projects/<ID>/doc.pdf",
    "tipoMime": "application/pdf",
    "tamanioBytes": 12345
  }'
```

### Subir archivo (multipart)

```bash
curl -X POST "http://localhost:3000/api/projects/<ID>/files/upload" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/ruta/al/archivo.pdf"
```

### Descargar archivo

```bash
curl -X GET "http://localhost:3000/api/projects/<ID>/files/<FILE_ID>/download" \
  -H "Authorization: Bearer <TOKEN>" \
  -O
```

### Eliminar archivo

```bash
curl -X DELETE "http://localhost:3000/api/projects/<ID>/files/<FILE_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Registrar vista única

```bash
curl -X POST "http://localhost:3000/api/projects/<ID>/views" \
  -H "Authorization: Bearer <TOKEN>"
```

### Curar proyecto (AUXILIAR/ADMIN)

```bash
curl -X POST "http://localhost:3000/api/projects/<ID>/curate" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "comentarioAuxiliar": "Excelente proyecto",
    "activo": true
  }'
```

### Listar tags

```bash
curl -X GET "http://localhost:3000/api/projects/tags"
```

### Listar categorías

```bash
curl -X GET "http://localhost:3000/api/projects/categories"
```

### Listar proyectos curados

```bash
curl -X GET "http://localhost:3000/api/projects/curated"
```

### Buscar proyectos

```bash
curl -X GET "http://localhost:3000/api/projects/search?tag=Java&categoryId=2&q=compilador&page=1&limit=10"
```

## Módulo C — Social (`/api/social`)

### Crear hilo

```bash
curl -X POST "http://localhost:3000/api/social/threads" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Duda de grafos",
    "contenido": "¿Cómo funciona Dijkstra?",
    "idCategoria": 3
  }'
```

### Listar hilos

```bash
curl -X GET "http://localhost:3000/api/social/threads?page=1&limit=10"
```

### Obtener hilo

```bash
curl -X GET "http://localhost:3000/api/social/threads/<ID>"
```

### Crear comentario en hilo

```bash
curl -X POST "http://localhost:3000/api/social/threads/<ID>/comments" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "contenido": "Mi respuesta",
    "idComentarioPadre": 1
  }'
```

### Listar comentarios de hilo

```bash
curl -X GET "http://localhost:3000/api/social/threads/<ID>/comments"
```

### Listar comentarios de hilo por score

```bash
curl -X GET "http://localhost:3000/api/social/threads/<ID>/comments/ranked"
```

### Crear artículo (AUXILIAR/ADMIN)

```bash
curl -X POST "http://localhost:3000/api/social/articles" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Guía NestJS",
    "contenidoHtml": "<p>Contenido</p>",
    "resumen": "Guía",
    "estado": "publicado"
  }'
```

### Listar artículos

```bash
curl -X GET "http://localhost:3000/api/social/articles?page=1&limit=10"
```

### Obtener artículo

```bash
curl -X GET "http://localhost:3000/api/social/articles/<ID>"
```

### Crear comentario en artículo

```bash
curl -X POST "http://localhost:3000/api/social/articles/<ID>/comments" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "contenido": "Excelente artículo",
    "idComentarioPadre": 1
  }'
```

### Listar comentarios de artículo

```bash
curl -X GET "http://localhost:3000/api/social/articles/<ID>/comments"
```

### Votar contenido

```bash
curl -X POST "http://localhost:3000/api/social/votes" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "upvote",
    "idComentario": 44
  }'
```

### Reportar contenido

```bash
curl -X POST "http://localhost:3000/api/social/reports" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "razon": "spam",
    "descripcion": "contenido repetitivo",
    "idHilo": 15
  }'
```

### Listar reportes (MODERADOR/ADMIN)

```bash
curl -X GET "http://localhost:3000/api/social/reports?estado=pendiente&page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

### Moderar reporte (MODERADOR/ADMIN)

```bash
curl -X PATCH "http://localhost:3000/api/social/reports/<ID>/status" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "estado": "resuelto" }'
```

## Módulo D — Admin (`/api/admin`)

### Listar usuarios

```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

### Activar/desactivar usuario

```bash
curl -X PATCH "http://localhost:3000/api/admin/users/<ID>/active" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "activo": false }'
```

### Asignar rol a usuario

```bash
curl -X POST "http://localhost:3000/api/admin/users/<ID>/roles" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "nombreRol": "AUXILIAR" }'
```

### Remover rol de usuario

```bash
curl -X DELETE "http://localhost:3000/api/admin/users/<ID>/roles/ADMIN" \
  -H "Authorization: Bearer <TOKEN>"
```

### Eliminar usuario

```bash
curl -X DELETE "http://localhost:3000/api/admin/users/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Listar suspensiones

```bash
curl -X GET "http://localhost:3000/api/admin/users/<ID>/suspensions" \
  -H "Authorization: Bearer <TOKEN>"
```

### Suspender usuario

```bash
curl -X POST "http://localhost:3000/api/admin/users/<ID>/suspensions" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "razon": "Incumplimiento", "detalle": "Spam" }'
```

### Cerrar suspensión

```bash
curl -X PATCH "http://localhost:3000/api/admin/users/<ID>/suspensions/<SUSP_ID>/close" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "notaCierre": "Tiempo cumplido" }'
```

### Listar roles

```bash
curl -X GET "http://localhost:3000/api/admin/roles" \
  -H "Authorization: Bearer <TOKEN>"
```

### Crear rol

```bash
curl -X POST "http://localhost:3000/api/admin/roles" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "nombreRol": "MODERADOR", "descripcion": "Acceso moderación" }'
```

### Actualizar rol

```bash
curl -X PATCH "http://localhost:3000/api/admin/roles/<ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "descripcion": "Rol actualizado" }'
```

### Eliminar rol

```bash
curl -X DELETE "http://localhost:3000/api/admin/roles/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Listar categorías

```bash
curl -X GET "http://localhost:3000/api/admin/categories" \
  -H "Authorization: Bearer <TOKEN>"
```

### Árbol de categorías

```bash
curl -X GET "http://localhost:3000/api/admin/categories/tree" \
  -H "Authorization: Bearer <TOKEN>"
```

### Crear categoría

```bash
curl -X POST "http://localhost:3000/api/admin/categories" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "IA", "descripcion": "Inteligencia Artificial", "areaTecnica": "IA" }'
```

### Actualizar categoría

```bash
curl -X PATCH "http://localhost:3000/api/admin/categories/<ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "descripcion": "Actualizada" }'
```

### Eliminar categoría

```bash
curl -X DELETE "http://localhost:3000/api/admin/categories/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Listar auditoría

```bash
curl -X GET "http://localhost:3000/api/admin/audit?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

### Listar reportes con contexto

```bash
curl -X GET "http://localhost:3000/api/admin/moderation/reports?estado=pendiente&page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

### Moderar reporte

```bash
curl -X PATCH "http://localhost:3000/api/admin/moderation/reports/<ID>/status" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "estado": "resuelto" }'
```

### Eliminar hilo

```bash
curl -X DELETE "http://localhost:3000/api/admin/moderation/threads/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Eliminar comentario

```bash
curl -X DELETE "http://localhost:3000/api/admin/moderation/comments/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Eliminar artículo

```bash
curl -X DELETE "http://localhost:3000/api/admin/moderation/articles/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Eliminar proyecto (moderación)

```bash
curl -X DELETE "http://localhost:3000/api/admin/moderation/projects/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```
