import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolEntity } from './rol.entity';
import { SesionEntity } from './sesion.entity';
import { MaterialGuardadoEntity } from './material-guardado.entity';

@Entity('usuario')
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido!: string;

  @Column({ name: 'email', type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    name: 'fecha_registro',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaRegistro!: Date;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'foto_perfil', type: 'varchar', length: 255, nullable: true })
  fotoPerfil?: string;

  @Column({ name: 'carnet', type: 'varchar', length: 20, nullable: true })
  carnet?: string;

  @Column({ name: 'semestre', type: 'int', nullable: true })
  semestre?: number;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'lock_until', type: 'timestamptz', nullable: true })
  lockUntil?: Date;

  @ManyToMany(() => RolEntity, (rol) => rol.usuarios)
  @JoinTable({
    name: 'usuario_rol',
    joinColumn: {
      name: 'id_usuario',
      referencedColumnName: 'idUsuario',
    },
    inverseJoinColumn: {
      name: 'id_rol',
      referencedColumnName: 'idRol',
    },
  })
  roles!: RolEntity[];

  @OneToMany(() => SesionEntity, (sesion) => sesion.usuario)
  sesiones!: SesionEntity[];

  @OneToMany(() => MaterialGuardadoEntity, (material) => material.usuario)
  materialGuardado!: MaterialGuardadoEntity[];
}
