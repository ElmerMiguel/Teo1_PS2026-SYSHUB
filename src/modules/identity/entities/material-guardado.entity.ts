import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

export enum TipoContenidoGuardado {
  PROYECTO = 'proyecto',
  ARTICULO = 'articulo',
  HILO = 'hilo',
}

@Entity('material_guardado')
export class MaterialGuardadoEntity {
  @PrimaryGeneratedColumn({ name: 'id_guardado', type: 'int' })
  idGuardado!: number;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.materialGuardado, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  @Column({ name: 'tipo_contenido', type: 'enum', enum: TipoContenidoGuardado })
  tipoContenido!: TipoContenidoGuardado;

  @Column({ name: 'id_contenido', type: 'int' })
  idContenido!: number;

  @Column({
    name: 'fecha_guardado',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaGuardado!: Date;
}
