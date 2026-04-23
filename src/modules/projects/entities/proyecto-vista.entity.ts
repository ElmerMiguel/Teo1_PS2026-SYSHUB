import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ProyectoEntity } from './proyecto.entity';

@Entity('proyecto_vista')
@Unique('uq_proyecto_vista_usuario', ['idProyecto', 'idUsuario'])
export class ProyectoVistaEntity {
  @PrimaryGeneratedColumn({ name: 'id_vista', type: 'int' })
  idVista!: number;

  @ManyToOne(() => ProyectoEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto!: ProyectoEntity;

  @Column({ name: 'id_proyecto', type: 'int' })
  idProyecto!: number;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @Column({
    name: 'fecha_visita',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaVisita!: Date;
}
