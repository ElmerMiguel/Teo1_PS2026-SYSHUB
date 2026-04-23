import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { ArticuloEntity } from './articulo.entity';
import { ComentarioEntity } from './comentario.entity';
import { HiloForoEntity } from './hilo-foro.entity';

export enum TipoValoracion {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

@Entity('valoracion')
export class ValoracionEntity {
  @PrimaryGeneratedColumn({ name: 'id_valoracion', type: 'int' })
  idValoracion!: number;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: TipoValoracion,
  })
  tipo!: TipoValoracion;

  @ManyToOne(() => UsuarioEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @ManyToOne(() => HiloForoEntity, (hilo) => hilo.valoraciones, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_hilo' })
  hilo?: HiloForoEntity;

  @Column({ name: 'id_hilo', type: 'int', nullable: true })
  idHilo?: number;

  @ManyToOne(() => ComentarioEntity, (comentario) => comentario.valoraciones, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_comentario' })
  comentario?: ComentarioEntity;

  @Column({ name: 'id_comentario', type: 'int', nullable: true })
  idComentario?: number;

  @ManyToOne(() => ArticuloEntity, (articulo) => articulo.valoraciones, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_articulo' })
  articulo?: ArticuloEntity;

  @Column({ name: 'id_articulo', type: 'int', nullable: true })
  idArticulo?: number;

  @Column({
    name: 'fecha',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fecha!: Date;
}
