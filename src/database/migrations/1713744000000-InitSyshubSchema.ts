import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSyshubSchema1713744000000 implements MigrationInterface {
  name = 'InitSyshubSchema1713744000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(
      `CREATE TYPE estado_proyecto AS ENUM ('borrador', 'pendiente', 'publicado', 'archivado');`,
    );
    await queryRunner.query(
      `CREATE TYPE estado_hilo AS ENUM ('abierto', 'cerrado', 'archivado');`,
    );
    await queryRunner.query(
      `CREATE TYPE estado_articulo AS ENUM ('borrador', 'publicado', 'archivado');`,
    );
    await queryRunner.query(
      `CREATE TYPE estado_reporte AS ENUM ('pendiente', 'resuelto', 'desestimado');`,
    );
    await queryRunner.query(
      `CREATE TYPE tipo_valoracion AS ENUM ('upvote', 'downvote');`,
    );
    await queryRunner.query(
      `CREATE TYPE area_tecnica_cat AS ENUM ('Desarrollo', 'IA', 'Infraestructura', 'Bases_de_Datos', 'Redes', 'Otro');`,
    );
    await queryRunner.query(
      `CREATE TYPE tipo_contenido_guardado AS ENUM ('proyecto', 'articulo', 'hilo');`,
    );

    await queryRunner.query(`
      CREATE TABLE ROL (
        id_rol INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(255)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ETIQUETA (
        id_etiqueta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3498db'
      );
    `);

    await queryRunner.query(`
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
    `);

    await queryRunner.query(`
      CREATE TABLE CATEGORIA (
        id_categoria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        area_tecnica area_tecnica_cat NOT NULL,
        id_categoria_padre INT REFERENCES CATEGORIA(id_categoria) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE USUARIO_ROL (
        id_usuario INT REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        id_rol INT REFERENCES ROL(id_rol) ON DELETE CASCADE,
        fecha_asignacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_usuario, id_rol)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE SESION (
        id_sesion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion TIMESTAMPTZ NOT NULL,
        ip_address INET,
        activa BOOLEAN DEFAULT TRUE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE PROYECTO (
        id_proyecto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        stack_tecnologico JSONB,
        fecha_publicacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        estado estado_proyecto DEFAULT 'borrador',
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        id_categoria INT REFERENCES CATEGORIA(id_categoria) ON DELETE SET NULL,
        vistas INT DEFAULT 0
      );
    `);

    await queryRunner.query(`
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
    `);

    await queryRunner.query(`
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
    `);

    await queryRunner.query(`
      CREATE TABLE ARCHIVO_PROYECTO (
        id_archivo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
        nombre_archivo VARCHAR(255) NOT NULL,
        ruta_archivo VARCHAR(500) NOT NULL,
        tipo_mime VARCHAR(100),
        tamanio_bytes BIGINT,
        fecha_subida TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE PROYECTO_ETIQUETA (
        id_proyecto INT REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
        id_etiqueta INT REFERENCES ETIQUETA(id_etiqueta) ON DELETE CASCADE,
        PRIMARY KEY (id_proyecto, id_etiqueta)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE CURADURIA (
        id_curaduria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_proyecto INT UNIQUE REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
        id_auxiliar INT REFERENCES USUARIO(id_usuario) ON DELETE SET NULL,
        comentario_auxiliar TEXT,
        fecha_destacado TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE COMENTARIO (
        id_comentario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        contenido TEXT NOT NULL,
        fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        id_hilo INT REFERENCES HILO_FORO(id_hilo) ON DELETE CASCADE,
        id_articulo INT REFERENCES ARTICULO(id_articulo) ON DELETE CASCADE,
        id_comentario_padre INT REFERENCES COMENTARIO(id_comentario) ON DELETE CASCADE,
        eliminado BOOLEAN DEFAULT FALSE,
        CONSTRAINT ck_comentario_destino CHECK (id_hilo IS NOT NULL OR id_articulo IS NOT NULL)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE VALORACION (
        id_valoracion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        tipo tipo_valoracion NOT NULL,
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        id_hilo INT REFERENCES HILO_FORO(id_hilo) ON DELETE CASCADE,
        id_comentario INT REFERENCES COMENTARIO(id_comentario) ON DELETE CASCADE,
        id_articulo INT REFERENCES ARTICULO(id_articulo) ON DELETE CASCADE,
        fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT ck_valoracion_destino CHECK (
          (id_hilo IS NOT NULL)::int +
          (id_comentario IS NOT NULL)::int +
          (id_articulo IS NOT NULL)::int = 1
        )
      );
    `);

    await queryRunner.query(`
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
    `);

    await queryRunner.query(`
      CREATE TABLE MATERIAL_GUARDADO (
        id_guardado INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        tipo_contenido tipo_contenido_guardado NOT NULL,
        id_contenido INT NOT NULL,
        fecha_guardado TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(
      `CREATE INDEX idx_usuario_email ON USUARIO(email);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_proyecto_usuario ON PROYECTO(id_usuario);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_proyecto_estado ON PROYECTO(estado);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_hilo_categoria ON HILO_FORO(id_categoria);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_comentario_padre ON COMENTARIO(id_comentario_padre);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_sesion_token ON SESION(token_hash);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_material_usuario ON MATERIAL_GUARDADO(id_usuario);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_material_usuario;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sesion_token;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comentario_padre;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hilo_categoria;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proyecto_estado;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proyecto_usuario;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_usuario_email;`);

    await queryRunner.query(`DROP TABLE IF EXISTS MATERIAL_GUARDADO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS REPORTE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS VALORACION;`);
    await queryRunner.query(`DROP TABLE IF EXISTS COMENTARIO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS CURADURIA;`);
    await queryRunner.query(`DROP TABLE IF EXISTS PROYECTO_ETIQUETA;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ARCHIVO_PROYECTO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS HILO_FORO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ARTICULO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS PROYECTO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS SESION;`);
    await queryRunner.query(`DROP TABLE IF EXISTS USUARIO_ROL;`);
    await queryRunner.query(`DROP TABLE IF EXISTS CATEGORIA;`);
    await queryRunner.query(`DROP TABLE IF EXISTS USUARIO;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ETIQUETA;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ROL;`);

    await queryRunner.query(`DROP TYPE IF EXISTS tipo_contenido_guardado;`);
    await queryRunner.query(`DROP TYPE IF EXISTS area_tecnica_cat;`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_valoracion;`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_reporte;`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_articulo;`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_hilo;`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_proyecto;`);
  }
}
