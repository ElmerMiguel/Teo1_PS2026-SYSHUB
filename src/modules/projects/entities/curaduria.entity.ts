import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ProyectoEntity } from './proyecto.entity';

@Entity('curaduria')
export class CuraduriaEntity {
  @PrimaryGeneratedColumn({ name: 'id_curaduria', type: 'int' })
  idCuraduria!: number;

  @OneToOne(() => ProyectoEntity, (proyecto) => proyecto.curaduria, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto!: ProyectoEntity;

  @Column({ name: 'id_proyecto', type: 'int', unique: true })
  idProyecto!: number;

  @ManyToOne(() => UsuarioEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_auxiliar' })
  auxiliar?: UsuarioEntity;

  @Column({ name: 'id_auxiliar', type: 'int', nullable: true })
  idAuxiliar?: number;

  @Column({ name: 'comentario_auxiliar', type: 'text', nullable: true })
  comentarioAuxiliar?: string;

  @Column({
    name: 'fecha_destacado',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaDestacado!: Date;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;
}
