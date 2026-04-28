import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';

@Entity('admin_audit')
export class AdminAuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_audit', type: 'int' })
  idAudit!: number;

  @Column({ name: 'accion', type: 'varchar', length: 120 })
  accion!: string;

  @Column({ name: 'entidad', type: 'varchar', length: 120 })
  entidad!: string;

  @Column({ name: 'entidad_id', type: 'int', nullable: true })
  entidadId?: number;

  @Column({ name: 'detalles', type: 'jsonb', nullable: true })
  detalles?: Record<string, unknown>;

  @Column({
    name: 'fecha_accion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAccion!: Date;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_admin' })
  admin!: UsuarioEntity;

  @Column({ name: 'id_admin', type: 'int' })
  idAdmin!: number;
}
