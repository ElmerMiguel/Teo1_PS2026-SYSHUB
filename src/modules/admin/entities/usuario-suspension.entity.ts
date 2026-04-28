import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';

@Entity('usuario_suspension')
export class UsuarioSuspensionEntity {
  @PrimaryGeneratedColumn({ name: 'id_suspension', type: 'int' })
  idSuspension!: number;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_admin' })
  admin!: UsuarioEntity;

  @Column({ name: 'id_admin', type: 'int' })
  idAdmin!: number;

  @Column({ name: 'razon', type: 'varchar', length: 255 })
  razon!: string;

  @Column({ name: 'detalle', type: 'text', nullable: true })
  detalle?: string;

  @Column({
    name: 'fecha_inicio',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaInicio!: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz', nullable: true })
  fechaFin?: Date;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;
}
