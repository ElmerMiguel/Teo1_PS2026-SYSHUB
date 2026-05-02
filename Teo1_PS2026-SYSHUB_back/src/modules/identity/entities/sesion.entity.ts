import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('sesion')
export class SesionEntity {
  @PrimaryGeneratedColumn({ name: 'id_sesion', type: 'int' })
  idSesion!: number;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.sesiones, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_expiracion', type: 'timestamptz' })
  fechaExpiracion!: Date;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ name: 'activa', type: 'boolean', default: true })
  activa!: boolean;
}
