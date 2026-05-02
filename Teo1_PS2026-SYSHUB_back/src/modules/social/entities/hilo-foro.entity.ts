import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { CategoriaEntity } from '../../projects/entities/categoria.entity';
import { ComentarioEntity } from './comentario.entity';
import { ValoracionEntity } from './valoracion.entity';
import { ReporteEntity } from './reporte.entity';

export enum EstadoHilo {
  ABIERTO = 'abierto',
  CERRADO = 'cerrado',
  ARCHIVADO = 'archivado',
}

@Entity('hilo_foro')
export class HiloForoEntity {
  @PrimaryGeneratedColumn({ name: 'id_hilo', type: 'int' })
  idHilo!: number;

  @Column({ name: 'titulo', type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ name: 'contenido', type: 'text' })
  contenido!: string;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion!: Date;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @ManyToOne(() => CategoriaEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_categoria' })
  categoria?: CategoriaEntity;

  @Column({ name: 'id_categoria', type: 'int', nullable: true })
  idCategoria?: number;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoHilo,
    default: EstadoHilo.ABIERTO,
  })
  estado!: EstadoHilo;

  @Column({ name: 'vistas', type: 'int', default: 0 })
  vistas!: number;

  @Column({ name: 'fijado', type: 'boolean', default: false })
  fijado!: boolean;

  @OneToMany(() => ComentarioEntity, (comentario) => comentario.hilo)
  comentarios!: ComentarioEntity[];

  @OneToMany(() => ValoracionEntity, (valoracion) => valoracion.hilo)
  valoraciones!: ValoracionEntity[];

  @OneToMany(() => ReporteEntity, (reporte) => reporte.hilo)
  reportes!: ReporteEntity[];
}
