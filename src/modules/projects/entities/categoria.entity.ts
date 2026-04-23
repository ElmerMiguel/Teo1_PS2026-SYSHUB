import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProyectoEntity } from './proyecto.entity';

export enum AreaTecnicaCategoria {
  DESARROLLO = 'Desarrollo',
  IA = 'IA',
  INFRAESTRUCTURA = 'Infraestructura',
  BASES_DE_DATOS = 'Bases_de_Datos',
  REDES = 'Redes',
  OTRO = 'Otro',
}

@Entity('categoria')
export class CategoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id_categoria', type: 'int' })
  idCategoria!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    name: 'area_tecnica',
    type: 'enum',
    enum: AreaTecnicaCategoria,
  })
  areaTecnica!: AreaTecnicaCategoria;

  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.subcategorias, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_categoria_padre' })
  categoriaPadre?: CategoriaEntity;

  @OneToMany(() => CategoriaEntity, (categoria) => categoria.categoriaPadre)
  subcategorias!: CategoriaEntity[];

  @OneToMany(() => ProyectoEntity, (proyecto) => proyecto.categoria)
  proyectos!: ProyectoEntity[];
}
