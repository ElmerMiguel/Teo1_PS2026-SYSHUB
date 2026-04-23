import { AreaTecnicaCategoria } from '../entities/categoria.entity';
import { EstadoProyecto } from '../entities/proyecto.entity';

export class ProjectTagResponseDto {
  idEtiqueta!: number;
  nombre!: string;
  color!: string;
}

export class ProjectCategoryResponseDto {
  idCategoria!: number;
  nombre!: string;
  descripcion?: string;
  areaTecnica!: AreaTecnicaCategoria;
}

export class ProjectFileResponseDto {
  idArchivo!: number;
  nombreArchivo!: string;
  rutaArchivo!: string;
  tipoMime?: string;
  tamanioBytes?: string;
  fechaSubida!: Date;
}

export class ProjectCurationResponseDto {
  idCuraduria!: number;
  idAuxiliar?: number;
  comentarioAuxiliar?: string;
  fechaDestacado!: Date;
  activo!: boolean;
}

export class ProjectResponseDto {
  idProyecto!: number;
  titulo!: string;
  descripcion?: string;
  stackTecnologico?: Record<string, unknown>;
  fechaPublicacion!: Date;
  estado!: EstadoProyecto;
  idUsuario!: number;
  idCategoria?: number;
  vistas!: number;
  categoria?: ProjectCategoryResponseDto;
  etiquetas!: ProjectTagResponseDto[];
  archivos?: ProjectFileResponseDto[];
  curaduria?: ProjectCurationResponseDto;
}

export class PaginatedProjectsResponseDto {
  items!: ProjectResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}
