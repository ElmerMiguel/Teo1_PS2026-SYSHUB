import { CategoriaEntity } from '../entities/categoria.entity';
import { EtiquetaEntity } from '../entities/etiqueta.entity';
import { ProyectoEntity } from '../entities/proyecto.entity';
import {
  PaginatedProjectsResponseDto,
  ProjectCategoryResponseDto,
  ProjectCurationResponseDto,
  ProjectFileResponseDto,
  ProjectResponseDto,
  ProjectTagResponseDto,
} from '../dto/project-response.dto';

export class ProjectsSerializer {
  static toTagDto(tag: EtiquetaEntity): ProjectTagResponseDto {
    return {
      idEtiqueta: tag.idEtiqueta,
      nombre: tag.nombre,
      color: tag.color,
    };
  }

  static toCategoryDto(category: CategoriaEntity): ProjectCategoryResponseDto {
    return {
      idCategoria: category.idCategoria,
      nombre: category.nombre,
      descripcion: category.descripcion,
      areaTecnica: category.areaTecnica,
    };
  }

  static toProjectDto(project: ProyectoEntity): ProjectResponseDto {
    const files: ProjectFileResponseDto[] | undefined = project.archivos?.map(
      (file) => ({
        idArchivo: file.idArchivo,
        nombreArchivo: file.nombreArchivo,
        rutaArchivo: file.rutaArchivo,
        tipoMime: file.tipoMime,
        tamanioBytes: file.tamanioBytes,
        fechaSubida: file.fechaSubida,
      }),
    );

    const curation: ProjectCurationResponseDto | undefined = project.curaduria
      ? {
          idCuraduria: project.curaduria.idCuraduria,
          idAuxiliar: project.curaduria.idAuxiliar,
          comentarioAuxiliar: project.curaduria.comentarioAuxiliar,
          fechaDestacado: project.curaduria.fechaDestacado,
          activo: project.curaduria.activo,
        }
      : undefined;

    return {
      idProyecto: project.idProyecto,
      titulo: project.titulo,
      descripcion: project.descripcion,
      stackTecnologico: project.stackTecnologico,
      fechaPublicacion: project.fechaPublicacion,
      estado: project.estado,
      idUsuario: project.idUsuario,
      idCategoria: project.idCategoria,
      vistas: project.vistas,
      categoria: project.categoria
        ? ProjectsSerializer.toCategoryDto(project.categoria)
        : undefined,
      etiquetas: (project.etiquetas ?? []).map((tag) =>
        ProjectsSerializer.toTagDto(tag),
      ),
      archivos: files,
      curaduria: curation,
    };
  }

  static toTagListDto(tags: EtiquetaEntity[]): ProjectTagResponseDto[] {
    return tags.map((tag) => ProjectsSerializer.toTagDto(tag));
  }

  static toCategoryListDto(
    categories: CategoriaEntity[],
  ): ProjectCategoryResponseDto[] {
    return categories.map((category) =>
      ProjectsSerializer.toCategoryDto(category),
    );
  }

  static toProjectListDto(projects: ProyectoEntity[]): ProjectResponseDto[] {
    return projects.map((project) => ProjectsSerializer.toProjectDto(project));
  }

  static toPaginatedProjectsDto(data: {
    items: ProyectoEntity[];
    total: number;
    page: number;
    limit: number;
  }): PaginatedProjectsResponseDto {
    return {
      items: ProjectsSerializer.toProjectListDto(data.items),
      total: data.total,
      page: data.page,
      limit: data.limit,
    };
  }
}
