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
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import {
  AreaTecnicaCategoria,
  CategoriaEntity,
} from '../../projects/entities/categoria.entity';
import {
  EstadoReporte,
  ReporteEntity,
} from '../../social/entities/reporte.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { ListAdminReportsDto } from '../dto/list-admin-reports.dto';
import { ListUsersDto } from '../dto/list-users.dto';
import {
  EstadoModeracionAdmin,
  ModerateReportDto,
} from '../dto/moderate-report.dto';
import { SetUserActiveDto } from '../dto/set-user-active.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly userRepository: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly roleRepository: Repository<RolEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoryRepository: Repository<CategoriaEntity>,
    @InjectRepository(ReporteEntity)
    private readonly reportRepository: Repository<ReporteEntity>,
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
    return this.userRepository.save(user);
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
    return this.userRepository.save(user);
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
    return this.userRepository.save(user);
  }

  async deleteUser(admin: JwtPayload, userId: number): Promise<void> {
    this.ensureAdminRole(admin.roles);
    const user = await this.findUserById(userId);
    await this.userRepository.remove(user);
  }

  async listCategories(user: JwtPayload): Promise<CategoriaEntity[]> {
    this.ensureAdminOrModeratorRole(user.roles);
    return this.categoryRepository.find({
      relations: { categoriaPadre: true },
      order: { nombre: 'ASC' },
    });
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

    return this.categoryRepository.save(category);
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

    return this.categoryRepository.save(category);
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
  }

  async listReports(user: JwtPayload, query: ListAdminReportsDto) {
    this.ensureAdminOrModeratorRole(user.roles);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.reportRepository
      .createQueryBuilder('r')
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

    return this.reportRepository.save(report);
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

  readonly availableAreas: AreaTecnicaCategoria[] = [
    AreaTecnicaCategoria.DESARROLLO,
    AreaTecnicaCategoria.IA,
    AreaTecnicaCategoria.INFRAESTRUCTURA,
    AreaTecnicaCategoria.BASES_DE_DATOS,
    AreaTecnicaCategoria.REDES,
    AreaTecnicaCategoria.OTRO,
  ];
}
