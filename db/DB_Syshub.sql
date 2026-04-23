-- ==========================================
-- Syshub
-- ==========================================

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS (Tipos de datos definidos)
CREATE TYPE estado_proyecto AS ENUM ('borrador', 'pendiente', 'publicado', 'archivado');
CREATE TYPE estado_hilo AS ENUM ('abierto', 'cerrado', 'archivado');
CREATE TYPE estado_articulo AS ENUM ('borrador', 'publicado', 'archivado');
CREATE TYPE estado_reporte AS ENUM ('pendiente', 'resuelto', 'desestimado');
CREATE TYPE tipo_valoracion AS ENUM ('upvote', 'downvote');
CREATE TYPE area_tecnica_cat AS ENUM ('Desarrollo', 'IA', 'Infraestructura', 'Bases_de_Datos', 'Redes', 'Otro');
CREATE TYPE tipo_contenido_guardado AS ENUM ('proyecto', 'articulo', 'hilo');

-- 2. TABLAS MAESTRAS (Sin dependencias)

CREATE TABLE ROL (
    id_rol INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE, -- ESTUDIANTE, AUXILIAR, MODERADOR, ADMIN
    descripcion VARCHAR(255)
);

CREATE TABLE ETIQUETA (
    id_etiqueta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3498db'
);

CREATE TABLE USUARIO (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    foto_perfil VARCHAR(255),
    carnet VARCHAR(20),
    semestre INT CHECK (semestre >= 1 AND semestre <= 15)
);

CREATE TABLE CATEGORIA (
    id_categoria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    area_tecnica area_tecnica_cat NOT NULL,
    id_categoria_padre INT REFERENCES CATEGORIA(id_categoria) ON DELETE SET NULL
);

-- 3. TABLAS DE RELACIÓN MUCHOS A MUCHOS Y SESIONES

CREATE TABLE USUARIO_ROL (
    id_usuario INT REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    id_rol INT REFERENCES ROL(id_rol) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_rol)
);

CREATE TABLE SESION (
    id_sesion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    ip_address INET, -- Tipo nativo de Postgres para IPs
    activa BOOLEAN DEFAULT TRUE
);

-- 4. TABLAS DE CONTENIDO PRINCIPAL

CREATE TABLE PROYECTO (
    id_proyecto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    stack_tecnologico JSONB, -- Almacenamiento eficiente de tecnologías
    fecha_publicacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    estado estado_proyecto DEFAULT 'borrador',
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    id_categoria INT REFERENCES CATEGORIA(id_categoria) ON DELETE SET NULL,
    vistas INT DEFAULT 0
);

CREATE TABLE ARTICULO (
    id_articulo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido_html TEXT NOT NULL,
    resumen TEXT,
    fecha_publicacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    id_autor INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    estado estado_articulo DEFAULT 'borrador',
    imagen_portada VARCHAR(500)
);

CREATE TABLE HILO_FORO (
    id_hilo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    id_categoria INT REFERENCES CATEGORIA(id_categoria) ON DELETE SET NULL,
    estado estado_hilo DEFAULT 'abierto',
    vistas INT DEFAULT 0,
    fijado BOOLEAN DEFAULT FALSE
);

-- 5. TABLAS DE SOPORTE Y DETALLES

CREATE TABLE ARCHIVO_PROYECTO (
    id_archivo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanio_bytes BIGINT,
    fecha_subida TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PROYECTO_ETIQUETA (
    id_proyecto INT REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
    id_etiqueta INT REFERENCES ETIQUETA(id_etiqueta) ON DELETE CASCADE,
    PRIMARY KEY (id_proyecto, id_etiqueta)
);

CREATE TABLE CURADURIA (
    id_curaduria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proyecto INT UNIQUE REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
    id_auxiliar INT REFERENCES USUARIO(id_usuario) ON DELETE SET NULL,
    comentario_auxiliar TEXT,
    fecha_destacado TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE COMENTARIO (
    id_comentario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    id_hilo INT REFERENCES HILO_FORO(id_hilo) ON DELETE CASCADE,
    id_articulo INT REFERENCES ARTICULO(id_articulo) ON DELETE CASCADE,
    id_comentario_padre INT REFERENCES COMENTARIO(id_comentario) ON DELETE CASCADE,
    eliminado BOOLEAN DEFAULT FALSE,
    -- Asegurar que el comentario pertenezca a algo
    CONSTRAINT ck_comentario_destino CHECK (id_hilo IS NOT NULL OR id_articulo IS NOT NULL)
);

-- 6. INTERACCIONES Y REPORTES

CREATE TABLE VALORACION (
    id_valoracion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo tipo_valoracion NOT NULL,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    id_hilo INT REFERENCES HILO_FORO(id_hilo) ON DELETE CASCADE,
    id_comentario INT REFERENCES COMENTARIO(id_comentario) ON DELETE CASCADE,
    id_articulo INT REFERENCES ARTICULO(id_articulo) ON DELETE CASCADE,
    fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Evitar valoraciones huérfanas
    CONSTRAINT ck_valoracion_destino CHECK (
        (id_hilo IS NOT NULL)::int + 
        (id_comentario IS NOT NULL)::int + 
        (id_articulo IS NOT NULL)::int = 1
    )
);

CREATE TABLE REPORTE (
    id_reporte INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razon VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_reporte TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    estado estado_reporte DEFAULT 'pendiente',
    id_reportador INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE SET NULL,
    id_hilo INT REFERENCES HILO_FORO(id_hilo) ON DELETE CASCADE,
    id_comentario INT REFERENCES COMENTARIO(id_comentario) ON DELETE CASCADE,
    id_proyecto INT REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
    id_moderador INT REFERENCES USUARIO(id_usuario) ON DELETE SET NULL
);

CREATE TABLE MATERIAL_GUARDADO (
    id_guardado INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    tipo_contenido tipo_contenido_guardado NOT NULL,
    id_contenido INT NOT NULL, -- ID genérico según diseño
    fecha_guardado TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Métricas de visibilidad por usuario único en proyectos
CREATE TABLE PROYECTO_VISTA (
    id_vista INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    fecha_visita TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_proyecto_vista_usuario UNIQUE (id_proyecto, id_usuario)
);

-- 7. ÍNDICES DE OPTIMIZACIÓN (DBA Performance)
CREATE INDEX idx_usuario_email ON USUARIO(email);
CREATE INDEX idx_proyecto_usuario ON PROYECTO(id_usuario);
CREATE INDEX idx_proyecto_estado ON PROYECTO(estado);
CREATE INDEX idx_hilo_categoria ON HILO_FORO(id_categoria);
CREATE INDEX idx_comentario_padre ON COMENTARIO(id_comentario_padre);
CREATE INDEX idx_sesion_token ON SESION(token_hash);
CREATE INDEX idx_material_usuario ON MATERIAL_GUARDADO(id_usuario);
CREATE INDEX idx_proyecto_vista_proyecto ON PROYECTO_VISTA(id_proyecto);
CREATE INDEX idx_proyecto_vista_usuario ON PROYECTO_VISTA(id_usuario);