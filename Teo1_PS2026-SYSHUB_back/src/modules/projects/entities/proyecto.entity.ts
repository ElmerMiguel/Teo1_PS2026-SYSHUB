import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ArchivoProyectoEntity } from './archivo-proyecto.entity';
import { CategoriaEntity } from './categoria.entity';
import { CuraduriaEntity } from './curaduria.entity';
import { EtiquetaEntity } from './etiqueta.entity';

export enum EstadoProyecto {
  BORRADOR = 'borrador',
  PENDIENTE = 'pendiente',
  PUBLICADO = 'publicado',
  ARCHIVADO = 'archivado',
}

@Entity('proyecto')
export class ProyectoEntity {
  @PrimaryGeneratedColumn({ name: 'id_proyecto', type: 'int' })
  idProyecto!: number;

  @Column({ name: 'titulo', type: 'varchar', length: 200 })
  titulo!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'stack_tecnologico', type: 'jsonb', nullable: true })
  stackTecnologico?: Record<string, unknown>;

  @Column({
    name: 'fecha_publicacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaPublicacion!: Date;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoProyecto,
    default: EstadoProyecto.BORRADOR,
  })
  estado!: EstadoProyecto;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.proyectos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_categoria' })
  categoria?: CategoriaEntity;

  @Column({ name: 'id_categoria', type: 'int', nullable: true })
  idCategoria?: number;

  @Column({ name: 'vistas', type: 'int', default: 0 })
  vistas!: number;

  @OneToMany(() => ArchivoProyectoEntity, (archivo) => archivo.proyecto)
  archivos!: ArchivoProyectoEntity[];

  @ManyToMany(() => EtiquetaEntity, (etiqueta) => etiqueta.proyectos)
  @JoinTable({
    name: 'proyecto_etiqueta',
    joinColumn: {
      name: 'id_proyecto',
      referencedColumnName: 'idProyecto',
    },
    inverseJoinColumn: {
      name: 'id_etiqueta',
      referencedColumnName: 'idEtiqueta',
    },
  })
  etiquetas!: EtiquetaEntity[];

  @OneToOne(() => CuraduriaEntity, (curaduria) => curaduria.proyecto)
  curaduria?: CuraduriaEntity;
}
