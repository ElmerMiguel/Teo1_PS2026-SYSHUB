import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProyectoVista1713747600000 implements MigrationInterface {
  name = 'AddProyectoVista1713747600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE PROYECTO_VISTA (
        id_vista INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        fecha_visita TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_proyecto_vista_usuario UNIQUE (id_proyecto, id_usuario)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX idx_proyecto_vista_proyecto ON PROYECTO_VISTA(id_proyecto);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_proyecto_vista_usuario ON PROYECTO_VISTA(id_usuario);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proyecto_vista_usuario;`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_proyecto_vista_proyecto;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS PROYECTO_VISTA;`);
  }
}
