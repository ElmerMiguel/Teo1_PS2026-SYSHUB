import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { RolEntity } from '../../identity/entities/rol.entity';
import { SesionEntity } from '../../identity/entities/sesion.entity';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import {
  AreaTecnicaCategoria,
  CategoriaEntity,
} from '../../projects/entities/categoria.entity';
import { ProyectoEntity } from '../../projects/entities/proyecto.entity';
import { ArticuloEntity } from '../../social/entities/articulo.entity';
import { ComentarioEntity } from '../../social/entities/comentario.entity';
import { HiloForoEntity } from '../../social/entities/hilo-foro.entity';
import {
  EstadoReporte,
  ReporteEntity,
} from '../../social/entities/reporte.entity';
import { AdminAuditEntity } from '../entities/admin-audit.entity';
import { UsuarioSuspensionEntity } from '../entities/usuario-suspension.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CloseSuspensionDto } from '../dto/close-suspension.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { CreateSuspensionDto } from '../dto/create-suspension.dto';
import { ListAuditDto } from '../dto/list-audit.dto';
import { ListAdminReportsDto } from '../dto/list-admin-reports.dto';
import { ListUsersDto } from '../dto/list-users.dto';
import {
  EstadoModeracionAdmin,
  ModerateReportDto,
} from '../dto/moderate-report.dto';
import { SetUserActiveDto } from '../dto/set-user-active.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly userRepository: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly roleRepository: Repository<RolEntity>,
    @InjectRepository(SesionEntity)
    private readonly sessionRepository: Repository<SesionEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoryRepository: Repository<CategoriaEntity>,
    @InjectRepository(ProyectoEntity)
    private readonly projectRepository: Repository<ProyectoEntity>,
    @InjectRepository(ArticuloEntity)
    private readonly articleRepository: Repository<ArticuloEntity>,
    @InjectRepository(ComentarioEntity)
    private readonly commentRepository: Repository<ComentarioEntity>,
    @InjectRepository(HiloForoEntity)
    private readonly threadRepository: Repository<HiloForoEntity>,
    @InjectRepository(ReporteEntity)
    private readonly reportRepository: Repository<ReporteEntity>,
    @InjectRepository(AdminAuditEntity)
    private readonly auditRepository: Repository<AdminAuditEntity>,
    @InjectRepository(UsuarioSuspensionEntity)
    private readonly suspensionRepository: Repository<UsuarioSuspensionEntity>,
  ) {}

  async listUsers(admin: JwtPayload, query: ListUsersDto) {
    this.ensureAdminRole(admin.roles);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'rol')
      .orderBy('u.fecha_registro', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (typeof query.activo === 'boolean') {
      qb.andWhere('u.activo = :activo', { activo: query.activo });
    }

    if (query.q) {
      qb.andWhere(
        '(u.nombre ILIKE :q OR u.apellido ILIKE :q OR u.email ILIKE :q OR u.carnet ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async setUserActive(
    admin: JwtPayload,
    userId: number,
    dto: SetUserActiveDto,
  ): Promise<UsuarioEntity> {
    this.ensureAdminRole(admin.roles);

    const user = await this.findUserById(userId);
    user.activo = dto.activo;
    const saved = await this.userRepository.save(user);
    await this.logAudit(admin.sub, 'SET_USER_ACTIVE', 'usuario', userId, {
      activo: dto.activo,
    });
    return saved;
  }

  async assignRole(
    admin: JwtPayload,
    userId: number,
    dto: AssignRoleDto,
  ): Promise<UsuarioEntity> {
    this.ensureAdminRole(admin.roles);

    const user = await this.findUserById(userId);
    const role = await this.findRoleByName(dto.nombreRol);

    const hasRole = user.roles.some((item) => item.idRol === role.idRol);
    if (hasRole) {
      throw new BadRequestException('El usuario ya tiene ese rol');
    }

    user.roles = [...user.roles, role];
    const saved = await this.userRepository.save(user);
    await this.logAudit(admin.sub, 'ASSIGN_ROLE', 'usuario', userId, {
      rol: role.nombreRol,
    });
    return saved;
  }

  async removeRole(
    admin: JwtPayload,
    userId: number,
    roleName: string,
  ): Promise<UsuarioEntity> {
    this.ensureAdminRole(admin.roles);

    const user = await this.findUserById(userId);
    const role = await this.findRoleByName(roleName);

    const filtered = user.roles.filter((item) => item.idRol !== role.idRol);
    if (filtered.length === user.roles.length) {
      throw new BadRequestException('El usuario no tiene ese rol');
    }

    user.roles = filtered;
    const saved = await this.userRepository.save(user);
    await this.logAudit(admin.sub, 'REMOVE_ROLE', 'usuario', userId, {
      rol: role.nombreRol,
    });
    return saved;
  }

  async deleteUser(admin: JwtPayload, userId: number): Promise<void> {
    this.ensureAdminRole(admin.roles);
    const user = await this.findUserById(userId);
    await this.userRepository.remove(user);
    await this.logAudit(admin.sub, 'DELETE_USER', 'usuario', userId);
  }

  async listRoles(admin: JwtPayload): Promise<RolEntity[]> {
    this.ensureAdminRole(admin.roles);
    return this.roleRepository.find({ order: { nombreRol: 'ASC' } });
  }

  async listAudits(admin: JwtPayload, query: ListAuditDto) {
    this.ensureAdminRole(admin.roles);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.auditRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.admin', 'admin')
      .orderBy('a.fecha_accion', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async createRole(admin: JwtPayload, dto: CreateRoleDto): Promise<RolEntity> {
    this.ensureAdminRole(admin.roles);

    const normalized = dto.nombreRol.trim().toUpperCase();
    const existing = await this.roleRepository.findOne({
      where: { nombreRol: normalized },
    });

    if (existing) {
      throw new BadRequestException('El rol ya existe');
    }

    const role = this.roleRepository.create({
      nombreRol: normalized,
      descripcion: dto.descripcion,
    });

    const saved = await this.roleRepository.save(role);
    await this.logAudit(admin.sub, 'CREATE_ROLE', 'rol', saved.idRol, {
      nombreRol: normalized,
    });

    return saved;
  }

  async updateRole(
    admin: JwtPayload,
    roleId: number,
    dto: UpdateRoleDto,
  ): Promise<RolEntity> {
    this.ensureAdminRole(admin.roles);

    const role = await this.roleRepository.findOne({
      where: { idRol: roleId },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    if (dto.nombreRol !== undefined) {
      role.nombreRol = dto.nombreRol.trim().toUpperCase();
    }
    if (dto.descripcion !== undefined) {
      role.descripcion = dto.descripcion;
    }

    const saved = await this.roleRepository.save(role);
    await this.logAudit(admin.sub, 'UPDATE_ROLE', 'rol', roleId);
    return saved;
  }

  async deleteRole(admin: JwtPayload, roleId: number): Promise<void> {
    this.ensureAdminRole(admin.roles);

    const role = await this.roleRepository.findOne({
      where: { idRol: roleId },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    await this.roleRepository.remove(role);
    await this.logAudit(admin.sub, 'DELETE_ROLE', 'rol', roleId);
  }

  async listCategories(user: JwtPayload): Promise<CategoriaEntity[]> {
    this.ensureAdminOrModeratorRole(user.roles);
    return this.categoryRepository.find({
      relations: { categoriaPadre: true },
      order: { nombre: 'ASC' },
    });
  }

  async listCategoryTree(user: JwtPayload): Promise<CategoriaEntity[]> {
    this.ensureAdminOrModeratorRole(user.roles);

    const categories = await this.categoryRepository.find({
      relations: { categoriaPadre: true },
      order: { nombre: 'ASC' },
    });

    return this.buildCategoryTree(categories);
  }

  async createCategory(
    admin: JwtPayload,
    dto: CreateCategoryDto,
  ): Promise<CategoriaEntity> {
    this.ensureAdminRole(admin.roles);

    const parent = await this.resolveParentCategory(dto.idCategoriaPadre);

    const category = this.categoryRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      areaTecnica: dto.areaTecnica,
      categoriaPadre: parent,
    });

    const saved = await this.categoryRepository.save(category);
    await this.logAudit(
      admin.sub,
      'CREATE_CATEGORY',
      'categoria',
      saved.idCategoria,
    );
    return saved;
  }

  async updateCategory(
    admin: JwtPayload,
    categoryId: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoriaEntity> {
    this.ensureAdminRole(admin.roles);

    const category = await this.categoryRepository.findOne({
      where: { idCategoria: categoryId },
      relations: { categoriaPadre: true },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (dto.nombre !== undefined) category.nombre = dto.nombre;
    if (dto.descripcion !== undefined) category.descripcion = dto.descripcion;
    if (dto.areaTecnica !== undefined) category.areaTecnica = dto.areaTecnica;

    if (dto.idCategoriaPadre !== undefined) {
      if (dto.idCategoriaPadre === category.idCategoria) {
        throw new BadRequestException(
          'Una categoría no puede ser su propia categoría padre',
        );
      }
      category.categoriaPadre = await this.resolveParentCategory(
        dto.idCategoriaPadre,
      );
    }

    const saved = await this.categoryRepository.save(category);
    await this.logAudit(admin.sub, 'UPDATE_CATEGORY', 'categoria', categoryId);
    return saved;
  }

  async deleteCategory(admin: JwtPayload, categoryId: number): Promise<void> {
    this.ensureAdminRole(admin.roles);

    const category = await this.categoryRepository.findOne({
      where: { idCategoria: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.categoryRepository.remove(category);
    await this.logAudit(admin.sub, 'DELETE_CATEGORY', 'categoria', categoryId);
  }

  async listReports(user: JwtPayload, query: ListAdminReportsDto) {
    this.ensureAdminOrModeratorRole(user.roles);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.reportRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.hilo', 'hilo')
      .leftJoinAndSelect('r.comentario', 'comentario')
      .leftJoinAndSelect('r.proyecto', 'proyecto')
      .leftJoinAndSelect('r.reportador', 'reportador')
      .leftJoinAndSelect('r.moderador', 'moderador')
      .orderBy('r.fecha_reporte', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.estado) {
      qb.andWhere('r.estado = :estado', { estado: query.estado });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async moderateReport(
    user: JwtPayload,
    reportId: number,
    dto: ModerateReportDto,
  ): Promise<ReporteEntity> {
    this.ensureAdminOrModeratorRole(user.roles);

    const report = await this.reportRepository.findOne({
      where: { idReporte: reportId },
    });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.estado !== EstadoReporte.PENDIENTE) {
      throw new BadRequestException('El reporte ya fue moderado');
    }

    report.estado =
      dto.estado === EstadoModeracionAdmin.RESUELTO
        ? EstadoReporte.RESUELTO
        : EstadoReporte.DESESTIMADO;
    report.idModerador = user.sub;

    const saved = await this.reportRepository.save(report);
    await this.logAudit(user.sub, 'MODERATE_REPORT', 'reporte', reportId, {
      estado: saved.estado,
    });
    return saved;
  }

  async createSuspension(
    admin: JwtPayload,
    userId: number,
    dto: CreateSuspensionDto,
  ): Promise<UsuarioSuspensionEntity> {
    this.ensureAdminOrModeratorRole(admin.roles);

    const user = await this.findUserById(userId);
    const activeSuspension = await this.suspensionRepository.findOne({
      where: { idUsuario: userId, activo: true },
    });

    if (activeSuspension) {
      throw new BadRequestException(
        'El usuario ya tiene una suspensión activa',
      );
    }

    user.activo = false;
    await this.userRepository.save(user);
    await this.revokeUserSessions(userId);

    const suspension = this.suspensionRepository.create({
      idUsuario: userId,
      idAdmin: admin.sub,
      razon: dto.razon,
      detalle: dto.detalle,
    });

    const saved = await this.suspensionRepository.save(suspension);
    await this.logAudit(admin.sub, 'SUSPEND_USER', 'usuario', userId, {
      razon: dto.razon,
    });

    return saved;
  }

  async closeSuspension(
    admin: JwtPayload,
    userId: number,
    suspensionId: number,
    dto: CloseSuspensionDto,
  ): Promise<UsuarioSuspensionEntity> {
    this.ensureAdminOrModeratorRole(admin.roles);

    const suspension = await this.suspensionRepository.findOne({
      where: { idSuspension: suspensionId, idUsuario: userId },
    });

    if (!suspension) {
      throw new NotFoundException('Suspensión no encontrada');
    }

    if (!suspension.activo) {
      throw new BadRequestException('La suspensión ya está cerrada');
    }

    suspension.activo = false;
    suspension.fechaFin = new Date();

    if (dto.notaCierre) {
      suspension.detalle = suspension.detalle
        ? `${suspension.detalle}\nCierre: ${dto.notaCierre}`
        : `Cierre: ${dto.notaCierre}`;
    }

    const saved = await this.suspensionRepository.save(suspension);

    const user = await this.findUserById(userId);
    user.activo = true;
    await this.userRepository.save(user);

    await this.logAudit(admin.sub, 'UNSUSPEND_USER', 'usuario', userId);
    return saved;
  }

  async listSuspensions(
    admin: JwtPayload,
    userId: number,
  ): Promise<UsuarioSuspensionEntity[]> {
    this.ensureAdminOrModeratorRole(admin.roles);

    await this.findUserById(userId);
    return this.suspensionRepository.find({
      where: { idUsuario: userId },
      order: { fechaInicio: 'DESC' },
    });
  }

  async deleteThread(admin: JwtPayload, idHilo: number): Promise<void> {
    this.ensureAdminOrModeratorRole(admin.roles);

    const thread = await this.threadRepository.findOne({
      where: { idHilo },
    });

    if (!thread) {
      throw new NotFoundException('Hilo no encontrado');
    }

    await this.threadRepository.remove(thread);
    await this.logAudit(admin.sub, 'DELETE_THREAD', 'hilo', idHilo);
  }

  async deleteArticle(admin: JwtPayload, idArticulo: number): Promise<void> {
    this.ensureAdminOrModeratorRole(admin.roles);

    const article = await this.articleRepository.findOne({
      where: { idArticulo },
    });

    if (!article) {
      throw new NotFoundException('Artículo no encontrado');
    }

    await this.articleRepository.remove(article);
    await this.logAudit(admin.sub, 'DELETE_ARTICLE', 'articulo', idArticulo);
  }

  async deleteComment(admin: JwtPayload, idComentario: number): Promise<void> {
    this.ensureAdminOrModeratorRole(admin.roles);

    const comment = await this.commentRepository.findOne({
      where: { idComentario },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    comment.eliminado = true;
    await this.commentRepository.save(comment);
    await this.logAudit(
      admin.sub,
      'DELETE_COMMENT',
      'comentario',
      idComentario,
    );
  }

  async deleteProject(admin: JwtPayload, idProyecto: number): Promise<void> {
    this.ensureAdminOrModeratorRole(admin.roles);

    const project = await this.projectRepository.findOne({
      where: { idProyecto },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    await this.projectRepository.remove(project);
    await this.logAudit(admin.sub, 'DELETE_PROJECT', 'proyecto', idProyecto);
  }

  private ensureAdminRole(roles: string[]): void {
    const normalized = roles.map((item) => item.toUpperCase());
    if (!normalized.includes('ADMIN')) {
      throw new ForbiddenException('Solo ADMIN puede realizar esta acción');
    }
  }

  private ensureAdminOrModeratorRole(roles: string[]): void {
    const normalized = roles.map((item) => item.toUpperCase());
    if (!normalized.includes('ADMIN') && !normalized.includes('MODERADOR')) {
      throw new ForbiddenException(
        'Solo ADMIN o MODERADOR puede realizar esta acción',
      );
    }
  }

  private async findUserById(userId: number): Promise<UsuarioEntity> {
    const user = await this.userRepository.findOne({
      where: { idUsuario: userId },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  private async findRoleByName(roleName: string): Promise<RolEntity> {
    const normalized = roleName.trim().toUpperCase();

    const role = await this.roleRepository.findOne({
      where: { nombreRol: normalized },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return role;
  }

  private async resolveParentCategory(
    parentId?: number,
  ): Promise<CategoriaEntity | undefined> {
    if (!parentId) return undefined;

    const parent = await this.categoryRepository.findOne({
      where: { idCategoria: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Categoría padre no encontrada');
    }

    return parent;
  }

  private buildCategoryTree(categories: CategoriaEntity[]): CategoriaEntity[] {
    const map = new Map<
      number,
      CategoriaEntity & { subcategorias: CategoriaEntity[] }
    >();
    const roots: CategoriaEntity[] = [];

    categories.forEach((category) => {
      map.set(category.idCategoria, {
        ...category,
        subcategorias: [],
      });
    });

    map.forEach((category) => {
      if (category.categoriaPadre?.idCategoria) {
        const parent = map.get(category.categoriaPadre.idCategoria);
        if (parent) {
          parent.subcategorias.push(category);
          return;
        }
      }
      roots.push(category);
    });

    return roots;
  }

  private async logAudit(
    adminId: number,
    action: string,
    entity: string,
    entityId?: number,
    details?: Record<string, unknown>,
  ): Promise<void> {
    const audit = this.auditRepository.create({
      idAdmin: adminId,
      accion: action,
      entidad: entity,
      entidadId: entityId,
      detalles: details,
    });

    await this.auditRepository.save(audit);
  }

  private async revokeUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      { idUsuario: userId, activa: true },
      { activa: false },
    );
  }

  readonly availableAreas: AreaTecnicaCategoria[] = [
    AreaTecnicaCategoria.DESARROLLO,
    AreaTecnicaCategoria.IA,
    AreaTecnicaCategoria.INFRAESTRUCTURA,
    AreaTecnicaCategoria.BASES_DE_DATOS,
    AreaTecnicaCategoria.REDES,
    AreaTecnicaCategoria.OTRO,
  ];
}
