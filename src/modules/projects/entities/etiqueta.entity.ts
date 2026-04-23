import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProyectoEntity } from './proyecto.entity';

@Entity('etiqueta')
export class EtiquetaEntity {
  @PrimaryGeneratedColumn({ name: 'id_etiqueta', type: 'int' })
  idEtiqueta!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre!: string;

  @Column({ name: 'color', type: 'varchar', length: 7, default: '#3498db' })
  color!: string;

  @ManyToMany(() => ProyectoEntity, (proyecto) => proyecto.etiquetas)
  proyectos!: ProyectoEntity[];
}
