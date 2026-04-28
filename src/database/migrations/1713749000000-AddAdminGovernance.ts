import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminGovernance1713749000000 implements MigrationInterface {
  name = 'AddAdminGovernance1713749000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE admin_audit (
        id_audit INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        accion VARCHAR(120) NOT NULL,
        entidad VARCHAR(120) NOT NULL,
        entidad_id INT,
        detalles JSONB,
        fecha_accion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        id_admin INT REFERENCES USUARIO(id_usuario) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE usuario_suspension (
        id_suspension INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
        id_admin INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE SET NULL,
        razon VARCHAR(255) NOT NULL,
        detalle TEXT,
        fecha_inicio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        fecha_fin TIMESTAMPTZ,
        activo BOOLEAN DEFAULT TRUE
      );
    `);

    await queryRunner.query(
      `CREATE INDEX idx_admin_audit_admin ON admin_audit(id_admin);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_suspension_usuario ON usuario_suspension(id_usuario);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_suspension_usuario;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_admin_audit_admin;`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuario_suspension;`);
    await queryRunner.query(`DROP TABLE IF EXISTS admin_audit;`);
  }
}
