import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ProyectoEntity } from '../../projects/entities/proyecto.entity';
import { ComentarioEntity } from './comentario.entity';
import { HiloForoEntity } from './hilo-foro.entity';

export enum EstadoReporte {
  PENDIENTE = 'pendiente',
  RESUELTO = 'resuelto',
  DESESTIMADO = 'desestimado',
}

@Entity('reporte')
export class ReporteEntity {
  @PrimaryGeneratedColumn({ name: 'id_reporte', type: 'int' })
  idReporte!: number;

  @Column({ name: 'razon', type: 'varchar', length: 255 })
  razon!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    name: 'fecha_reporte',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaReporte!: Date;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoReporte,
    default: EstadoReporte.PENDIENTE,
  })
  estado!: EstadoReporte;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_reportador' })
  reportador!: UsuarioEntity;

  @Column({ name: 'id_reportador', type: 'int' })
  idReportador!: number;

  @ManyToOne(() => HiloForoEntity, (hilo) => hilo.reportes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_hilo' })
  hilo?: HiloForoEntity;

  @Column({ name: 'id_hilo', type: 'int', nullable: true })
  idHilo?: number;

  @ManyToOne(() => ComentarioEntity, (comentario) => comentario.reportes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_comentario' })
  comentario?: ComentarioEntity;

  @Column({ name: 'id_comentario', type: 'int', nullable: true })
  idComentario?: number;

  @ManyToOne(() => ProyectoEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto?: ProyectoEntity;

  @Column({ name: 'id_proyecto', type: 'int', nullable: true })
  idProyecto?: number;

  @ManyToOne(() => UsuarioEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_moderador' })
  moderador?: UsuarioEntity;

  @Column({ name: 'id_moderador', type: 'int', nullable: true })
  idModerador?: number;
}
