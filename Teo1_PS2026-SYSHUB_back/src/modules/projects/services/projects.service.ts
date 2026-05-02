import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { AddProjectFileDto } from '../dto/add-project-file.dto';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CurateProjectDto } from '../dto/curate-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ArchivoProyectoEntity } from '../entities/archivo-proyecto.entity';
import { CategoriaEntity } from '../entities/categoria.entity';
import { CuraduriaEntity } from '../entities/curaduria.entity';
import { EtiquetaEntity } from '../entities/etiqueta.entity';
import { ProyectoEntity, EstadoProyecto } from '../entities/proyecto.entity';
import { ProyectoVistaEntity } from '../entities/proyecto-vista.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProyectoEntity)
    private readonly projectRepository: Repository<ProyectoEntity>,
    @InjectRepository(ArchivoProyectoEntity)
    private readonly fileRepository: Repository<ArchivoProyectoEntity>,
    @InjectRepository(CuraduriaEntity)
    private readonly curationRepository: Repository<CuraduriaEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoryRepository: Repository<CategoriaEntity>,
    @InjectRepository(EtiquetaEntity)
    private readonly tagRepository: Repository<EtiquetaEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly userRepository: Repository<UsuarioEntity>,
    @InjectRepository(ProyectoVistaEntity)
    private readonly projectViewRepository: Repository<ProyectoVistaEntity>,
  ) {}

  async createProject(userId: number, dto: CreateProjectDto) {
    if (dto.estado === EstadoProyecto.PUBLICADO) {
      throw new BadRequestException(
        'No puedes crear un proyecto publicado sin adjuntos; crea en borrador, sube archivos y luego publica.',
      );
    }

    await this.ensureUserExists(userId);
    await this.ensureCategoryExists(dto.idCategoria);

    const tags = await this.resolveTags(dto.etiquetas);
    const project = this.projectRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      stackTecnologico: dto.stackTecnologico,
      estado: dto.estado,
      idUsuario: userId,
      idCategoria: dto.idCategoria,
      etiquetas: tags,
    });

    const saved = await this.projectRepository.save(project);

    return this.findById(saved.idProyecto);
  }

  async deleteProject(user: JwtPayload, projectId: number) {
    const project = await this.findById(projectId);
    this.ensureOwner(user, project.idUsuario);

    // delete files from disk
    if (project.archivos && project.archivos.length > 0) {
      for (const archivo of project.archivos) {
        try {
          const full = path.join(process.cwd(), archivo.rutaArchivo);
          await fs.unlink(full);
        } catch {
          // ignore missing files
        }
      }
    }

    await this.projectRepository.delete({ idProyecto: projectId });
    return { deleted: true };
  }

  async deleteFile(user: JwtPayload, projectId: number, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { idArchivo: fileId },
      relations: { proyecto: true },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }
    if (file.idProyecto !== projectId) {
      throw new NotFoundException('Archivo no pertenece al proyecto');
    }

    this.ensureOwner(user, file.proyecto.idUsuario);

    try {
      const full = path.join(process.cwd(), file.rutaArchivo);
      await fs.unlink(full);
    } catch {
      // ignore
    }

    await this.fileRepository.delete({ idArchivo: fileId });
    return this.findById(projectId);
  }

  async getFile(user: JwtPayload, projectId: number, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { idArchivo: fileId },
      relations: { proyecto: true },
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }
    if (file.idProyecto !== projectId) {
      throw new NotFoundException('Archivo no pertenece al proyecto');
    }

    const isAdmin = user.roles.some(
      (r) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ADMINISTRADOR',
    );
    const isOwner = user.sub === file.proyecto.idUsuario;
    const isPublished = file.proyecto.estado === EstadoProyecto.PUBLICADO;

    if (!isPublished && !isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tienes permiso para descargar este archivo',
      );
    }

    const full = path.join(process.cwd(), file.rutaArchivo);
    return { path: full, filename: file.nombreArchivo, mime: file.tipoMime };
  }

  async listTags() {
    return this.tagRepository.find({ order: { nombre: 'ASC' } });
  }

  async listCategories() {
    return this.categoryRepository.find({ order: { nombre: 'ASC' } });
  }

  async listCuratedProjects() {
    return this.projectRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.curaduria', 'c')
      .leftJoinAndSelect('p.categoria', 'cat')
      .leftJoinAndSelect('p.etiquetas', 'e')
      .where('c.activo = true')
      .orderBy('c.fechaDestacado', 'DESC')
      .getMany();
  }

  async searchProjects(options: {
    tag?: string;
    categoryId?: number;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;

    const qb = this.projectRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'cat')
      .leftJoinAndSelect('p.etiquetas', 'e')
      .leftJoinAndSelect('p.curaduria', 'c');

    if (options.tag) {
      qb.andWhere('e.nombre = :tag', { tag: options.tag });
    }

    if (options.categoryId) {
      qb.andWhere('p.idCategoria = :catId', { catId: options.categoryId });
    }

    if (options.q) {
      qb.andWhere('(p.titulo ILIKE :q OR p.descripcion ILIKE :q)', {
        q: `%${options.q}%`,
      });
    }

    qb.orderBy('p.idProyecto', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async listProjects() {
    return this.projectRepository.find({
      relations: {
        categoria: true,
        etiquetas: true,
        curaduria: true,
      },
      order: { idProyecto: 'DESC' },
    });
  }

  async listMyProjects(userId: number) {
    return this.projectRepository.find({
      where: { idUsuario: userId },
      relations: {
        categoria: true,
        etiquetas: true,
        curaduria: true,
      },
      order: { idProyecto: 'DESC' },
    });
  }

  async registerProjectView(user: JwtPayload, projectId: number) {
    const project = await this.projectRepository.findOne({
      where: { idProyecto: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.estado !== EstadoProyecto.PUBLICADO) {
      throw new BadRequestException(
        'Solo se registran vistas para proyectos publicados',
      );
    }

    const existingView = await this.projectViewRepository.findOne({
      where: { idProyecto: projectId, idUsuario: user.sub },
    });

    if (existingView) {
      return { projectId, vistas: project.vistas ?? 0, viewed: false };
    }

    const view = this.projectViewRepository.create({
      idProyecto: projectId,
      idUsuario: user.sub,
    });
    await this.projectViewRepository.save(view);

    project.vistas = (project.vistas ?? 0) + 1;
    await this.projectRepository.save(project);

    return { projectId, vistas: project.vistas, viewed: true };
  }

  async findById(projectId: number) {
    const project = await this.projectRepository.findOne({
      where: { idProyecto: projectId },
      relations: {
        categoria: true,
        etiquetas: true,
        archivos: true,
        curaduria: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  async updateProject(
    user: JwtPayload,
    projectId: number,
    dto: UpdateProjectDto,
  ) {
    const project = await this.findById(projectId);
    this.ensureOwner(user, project.idUsuario);

    await this.ensureCategoryExists(dto.idCategoria);

    const nextEstado = dto.estado ?? project.estado;

    project.titulo = dto.titulo ?? project.titulo;
    project.descripcion = dto.descripcion ?? project.descripcion;
    project.stackTecnologico = dto.stackTecnologico ?? project.stackTecnologico;
    project.estado = nextEstado;
    project.idCategoria = dto.idCategoria ?? project.idCategoria;

    if (dto.etiquetas) {
      project.etiquetas = await this.resolveTags(dto.etiquetas);
    }

    if (nextEstado === EstadoProyecto.PUBLICADO) {
      await this.validateProjectCanBePublished(projectId, project);
    }

    await this.projectRepository.save(project);
    return this.findById(projectId);
  }

  async addFile(user: JwtPayload, projectId: number, dto: AddProjectFileDto) {
    const project = await this.findById(projectId);
    this.ensureOwner(user, project.idUsuario);

    const file = this.fileRepository.create({
      idProyecto: projectId,
      nombreArchivo: dto.nombreArchivo,
      rutaArchivo: dto.rutaArchivo,
      tipoMime: dto.tipoMime,
      tamanioBytes:
        dto.tamanioBytes !== undefined ? String(dto.tamanioBytes) : undefined,
    });

    await this.fileRepository.save(file);
    return this.findById(projectId);
  }

  async curateProject(
    user: JwtPayload,
    projectId: number,
    dto: CurateProjectDto,
  ) {
    if (!this.hasCurationRole(user.roles)) {
      throw new ForbiddenException('No tienes permisos para curaduría');
    }

    await this.findById(projectId);

    let curation = await this.curationRepository.findOne({
      where: { idProyecto: projectId },
    });

    if (!curation) {
      curation = this.curationRepository.create({
        idProyecto: projectId,
        idAuxiliar: user.sub,
        comentarioAuxiliar: dto.comentarioAuxiliar,
        activo: dto.activo ?? true,
      });
    } else {
      curation.idAuxiliar = user.sub;
      curation.comentarioAuxiliar =
        dto.comentarioAuxiliar ?? curation.comentarioAuxiliar;
      curation.activo = dto.activo ?? curation.activo;
    }

    await this.curationRepository.save(curation);
    return this.findById(projectId);
  }

  private async ensureUserExists(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { idUsuario: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  private async ensureCategoryExists(categoryId?: number): Promise<void> {
    if (!categoryId) return;

    const category = await this.categoryRepository.findOne({
      where: { idCategoria: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }

  private async resolveTags(names?: string[]): Promise<EtiquetaEntity[]> {
    if (!names || names.length === 0) return [];

    const normalized = [
      ...new Set(names.map((name) => name.trim()).filter(Boolean)),
    ];
    if (normalized.length === 0) return [];

    const existing = await this.tagRepository.find({
      where: { nombre: In(normalized) },
    });

    const existingNames = new Set(existing.map((tag) => tag.nombre));
    const missing = normalized.filter((name) => !existingNames.has(name));

    const created = await this.tagRepository.save(
      missing.map((name) =>
        this.tagRepository.create({
          nombre: name,
        }),
      ),
    );

    return [...existing, ...created];
  }

  private ensureOwner(user: JwtPayload, ownerId: number) {
    const isAdmin = user.roles.some(
      (role) =>
        role.toUpperCase() === 'ADMIN' ||
        role.toUpperCase() === 'ADMINISTRADOR',
    );
    if (isAdmin) return;

    if (user.sub !== ownerId) {
      throw new ForbiddenException(
        'No tienes permisos para modificar este proyecto',
      );
    }
  }

  private hasCurationRole(roles: string[]): boolean {
    const normalized = roles.map((role) => role.toUpperCase());
    return (
      normalized.includes('AUXILIAR') ||
      normalized.includes('ADMIN') ||
      normalized.includes('ADMINISTRADOR')
    );
  }

  private async validateProjectCanBePublished(
    projectId: number,
    project: ProyectoEntity,
  ): Promise<void> {
    const hasDescription = Boolean(project.descripcion?.trim());
    const hasStack =
      !!project.stackTecnologico &&
      typeof project.stackTecnologico === 'object' &&
      Object.keys(project.stackTecnologico).length > 0;
    const hasTags = !!project.etiquetas && project.etiquetas.length > 0;

    if (!hasDescription || !hasStack || !hasTags) {
      throw new BadRequestException(
        'Para publicar el proyecto necesitas descripción, stack tecnológico y al menos una etiqueta.',
      );
    }

    const filesCount = await this.fileRepository.count({
      where: { idProyecto: projectId },
    });

    if (filesCount < 1) {
      throw new BadRequestException(
        'Para publicar el proyecto debes adjuntar al menos un archivo.',
      );
    }
  }
}
