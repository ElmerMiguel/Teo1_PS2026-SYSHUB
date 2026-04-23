import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ArticuloEntity } from './articulo.entity';
import { HiloForoEntity } from './hilo-foro.entity';
import { ValoracionEntity } from './valoracion.entity';
import { ReporteEntity } from './reporte.entity';

@Entity('comentario')
export class ComentarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_comentario', type: 'int' })
  idComentario!: number;

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

  @ManyToOne(() => HiloForoEntity, (hilo) => hilo.comentarios, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_hilo' })
  hilo?: HiloForoEntity;

  @Column({ name: 'id_hilo', type: 'int', nullable: true })
  idHilo?: number;

  @ManyToOne(() => ArticuloEntity, (articulo) => articulo.comentarios, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_articulo' })
  articulo?: ArticuloEntity;

  @Column({ name: 'id_articulo', type: 'int', nullable: true })
  idArticulo?: number;

  @ManyToOne(() => ComentarioEntity, (comentario) => comentario.respuestas, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_comentario_padre' })
  comentarioPadre?: ComentarioEntity;

  @Column({ name: 'id_comentario_padre', type: 'int', nullable: true })
  idComentarioPadre?: number;

  @OneToMany(() => ComentarioEntity, (comentario) => comentario.comentarioPadre)
  respuestas!: ComentarioEntity[];

  @Column({ name: 'eliminado', type: 'boolean', default: false })
  eliminado!: boolean;

  @OneToMany(() => ValoracionEntity, (valoracion) => valoracion.comentario)
  valoraciones!: ValoracionEntity[];

  @OneToMany(() => ReporteEntity, (reporte) => reporte.comentario)
  reportes!: ReporteEntity[];
}
