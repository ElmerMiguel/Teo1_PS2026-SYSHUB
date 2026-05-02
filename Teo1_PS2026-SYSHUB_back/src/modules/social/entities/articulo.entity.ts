import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ComentarioEntity } from './comentario.entity';
import { ValoracionEntity } from './valoracion.entity';

export enum EstadoArticulo {
  BORRADOR = 'borrador',
  PUBLICADO = 'publicado',
  ARCHIVADO = 'archivado',
}

@Entity('articulo')
export class ArticuloEntity {
  @PrimaryGeneratedColumn({ name: 'id_articulo', type: 'int' })
  idArticulo!: number;

  @Column({ name: 'titulo', type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ name: 'contenido_html', type: 'text' })
  contenidoHtml!: string;

  @Column({ name: 'resumen', type: 'text', nullable: true })
  resumen?: string;

  @Column({
    name: 'fecha_publicacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaPublicacion!: Date;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_autor' })
  autor!: UsuarioEntity;

  @Column({ name: 'id_autor', type: 'int' })
  idAutor!: number;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoArticulo,
    default: EstadoArticulo.BORRADOR,
  })
  estado!: EstadoArticulo;

  @Column({
    name: 'imagen_portada',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imagenPortada?: string;

  @OneToMany(() => ComentarioEntity, (comentario) => comentario.articulo)
  comentarios!: ComentarioEntity[];

  @OneToMany(() => ValoracionEntity, (valoracion) => valoracion.articulo)
  valoraciones!: ValoracionEntity[];
}
