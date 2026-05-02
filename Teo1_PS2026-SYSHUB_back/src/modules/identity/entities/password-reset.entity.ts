import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('password_reset')
export class PasswordResetEntity {
  @PrimaryGeneratedColumn({ name: 'id_reset', type: 'int' })
  idReset!: number;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
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

  @Column({ name: 'usado', type: 'boolean', default: false })
  usado!: boolean;
}
