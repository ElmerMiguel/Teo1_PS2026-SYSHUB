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
