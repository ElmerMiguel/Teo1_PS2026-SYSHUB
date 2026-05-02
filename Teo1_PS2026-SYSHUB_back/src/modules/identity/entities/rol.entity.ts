import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('rol')
export class RolEntity {
  @PrimaryGeneratedColumn({ name: 'id_rol', type: 'int' })
  idRol!: number;

  @Column({ name: 'nombre_rol', type: 'varchar', length: 50, unique: true })
  nombreRol!: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion?: string;

  @ManyToMany(() => UsuarioEntity, (usuario) => usuario.roles)
  usuarios!: UsuarioEntity[];
}
