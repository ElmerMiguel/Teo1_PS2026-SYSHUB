import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProyectoEntity } from './proyecto.entity';

@Entity('archivo_proyecto')
export class ArchivoProyectoEntity {
  @PrimaryGeneratedColumn({ name: 'id_archivo', type: 'int' })
  idArchivo!: number;

  @ManyToOne(() => ProyectoEntity, (proyecto) => proyecto.archivos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto!: ProyectoEntity;

  @Column({ name: 'id_proyecto', type: 'int' })
  idProyecto!: number;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 255 })
  nombreArchivo!: string;

  @Column({ name: 'ruta_archivo', type: 'varchar', length: 500 })
  rutaArchivo!: string;

  @Column({ name: 'tipo_mime', type: 'varchar', length: 100, nullable: true })
  tipoMime?: string;

  @Column({ name: 'tamanio_bytes', type: 'bigint', nullable: true })
  tamanioBytes?: string;

  @Column({
    name: 'fecha_subida',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaSubida!: Date;
}
