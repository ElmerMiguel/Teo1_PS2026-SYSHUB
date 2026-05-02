import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { RolEntity } from '../entities/rol.entity';
import { UsuarioEntity } from '../entities/usuario.entity';
import {
  MaterialGuardadoEntity,
  TipoContenidoGuardado,
} from '../entities/material-guardado.entity';
import { PasswordResetEntity } from '../entities/password-reset.entity';
import { ProyectoEntity } from '../../projects/entities/proyecto.entity';
import { HiloForoEntity } from '../../social/entities/hilo-foro.entity';
import { ComentarioEntity } from '../../social/entities/comentario.entity';
import { ArticuloEntity } from '../../social/entities/articulo.entity';
import { SaveMaterialDto } from '../dto/save-material.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

type AuthUserResponse = {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  carnet?: string;
  semestre?: number;
  fotoPerfil?: string;
  roles: string[];
};

type AuthResponse = {
  accessToken?: string;
  message?: string;
  user: AuthUserResponse;
};

type ProfileResponse = {
  user: AuthUserResponse;
  stats: {
    proyectos: number;
    respuestas: number;
    articulos: number;
    guardados: number;
  };
  recentProjects: ProyectoEntity[];
  recentThreads: HiloForoEntity[];
};

type SavedMaterialResponse = {
  idGuardado: number;
  tipoContenido: TipoContenidoGuardado;
  idContenido: number;
  titulo: string;
  fechaGuardado: Date;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly userRepository: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly roleRepository: Repository<RolEntity>,
    @InjectRepository(MaterialGuardadoEntity)
    private readonly savedRepository: Repository<MaterialGuardadoEntity>,
    @InjectRepository(PasswordResetEntity)
    private readonly passwordResetRepository: Repository<PasswordResetEntity>,
    @InjectRepository(ProyectoEntity)
    private readonly projectRepository: Repository<ProyectoEntity>,
    @InjectRepository(HiloForoEntity)
    private readonly threadRepository: Repository<HiloForoEntity>,
    @InjectRepository(ComentarioEntity)
    private readonly commentRepository: Repository<ComentarioEntity>,
    @InjectRepository(ArticuloEntity)
    private readonly articleRepository: Repository<ArticuloEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      email: registerDto.email.toLowerCase(),
      passwordHash,
      carnet: registerDto.carnet,
      semestre: registerDto.semestre,
      activo: false,
    });

    const savedUser = await this.userRepository.save(user);
    const defaultRole = await this.getOrCreateDefaultRole();

    savedUser.roles = [defaultRole];
    await this.userRepository.save(savedUser);

    const userWithRoles = await this.findUserById(savedUser.idUsuario);
    return {
      message: 'Cuenta creada. Espera activación del administrador.',
      user: this.toUserResponse(userWithRoles),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.findUserByEmail(loginDto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente. Intenta más tarde.',
      );
    }

    if (!user.activo) {
      throw new UnauthorizedException('La cuenta está inactiva');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
      if (user.failedLoginAttempts >= 3) {
        const lockMinutes = 15;
        user.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      }
      await this.userRepository.save(user);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await this.userRepository.save(user);

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: number): Promise<ProfileResponse> {
    const user = await this.findUserById(userId);
    const [projects, comments, articles, saved] = await Promise.all([
      this.projectRepository.count({ where: { idUsuario: userId } }),
      this.commentRepository.count({ where: { idUsuario: userId } }),
      this.articleRepository.count({ where: { idAutor: userId } }),
      this.savedRepository.count({ where: { idUsuario: userId } }),
    ]);

    const recentProjects = await this.projectRepository.find({
      where: { idUsuario: userId },
      order: { fechaPublicacion: 'DESC' },
      take: 5,
    });

    const recentThreads = await this.threadRepository.find({
      where: { idUsuario: userId },
      order: { fechaCreacion: 'DESC' },
      take: 5,
    });

    return {
      user: this.toUserResponse(user),
      stats: {
        proyectos: projects,
        respuestas: comments,
        articulos: articles,
        guardados: saved,
      },
      recentProjects,
      recentThreads,
    };
  }

  async updateProfile(
    userId: number,
    payload: UpdateProfileDto,
  ): Promise<AuthUserResponse> {
    const user = await this.findUserById(userId);

    user.nombre = payload.nombre ?? user.nombre;
    user.apellido = payload.apellido ?? user.apellido;
    user.fotoPerfil = payload.fotoPerfil ?? user.fotoPerfil;
    user.carnet = payload.carnet ?? user.carnet;
    user.semestre = payload.semestre ?? user.semestre;

    const updatedUser = await this.userRepository.save(user);
    return this.toUserResponse(updatedUser);
  }

  private async buildAuthResponse(user: UsuarioEntity): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.idUsuario,
      email: user.email,
      roles: user.roles.map((role) => role.nombreRol),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ??
        '1d') as never,
    });

    return {
      accessToken,
      user: this.toUserResponse(user),
    };
  }

  async requestPasswordReset(
    payload: RequestPasswordResetDto,
  ): Promise<{ message: string; token?: string; resetUrl?: string }> {
    const user = await this.findUserByEmail(payload.email.toLowerCase());
    if (!user) {
      return { message: 'Si el correo existe, enviaremos un enlace.' };
    }

    const token = randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);
    const reset = this.passwordResetRepository.create({
      idUsuario: user.idUsuario,
      tokenHash,
      fechaExpiracion: new Date(Date.now() + 60 * 60 * 1000),
      usado: false,
    });
    await this.passwordResetRepository.save(reset);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const frontendBase = frontendUrl ?? 'http://localhost:8080';
    const resetUrl = `${frontendBase}/auth/reset?token=${token}`;

    return {
      message: 'Enlace de recuperación generado. Revisa tu correo.',
      token,
      resetUrl,
    };
  }

  async resetPassword(payload: ResetPasswordDto): Promise<{ message: string }> {
    const candidates = await this.passwordResetRepository.find({
      where: {
        usado: false,
        fechaExpiracion: MoreThan(new Date()),
      },
    });

    const match = await this.findValidReset(candidates, payload.token);
    if (!match) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    const user = await this.findUserById(match.idUsuario);
    user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await this.userRepository.save(user);

    match.usado = true;
    await this.passwordResetRepository.save(match);

    return { message: 'Contraseña actualizada correctamente.' };
  }

  async listSavedMaterial(userId: number): Promise<SavedMaterialResponse[]> {
    const saved = await this.savedRepository.find({
      where: { idUsuario: userId },
      order: { fechaGuardado: 'DESC' },
    });

    const projectIds = saved
      .filter((item) => item.tipoContenido === TipoContenidoGuardado.PROYECTO)
      .map((item) => item.idContenido);
    const threadIds = saved
      .filter((item) => item.tipoContenido === TipoContenidoGuardado.HILO)
      .map((item) => item.idContenido);
    const articleIds = saved
      .filter((item) => item.tipoContenido === TipoContenidoGuardado.ARTICULO)
      .map((item) => item.idContenido);

    const [projects, threads, articles] = await Promise.all([
      projectIds.length
        ? this.projectRepository.findByIds(projectIds)
        : Promise.resolve([]),
      threadIds.length
        ? this.threadRepository.findByIds(threadIds)
        : Promise.resolve([]),
      articleIds.length
        ? this.articleRepository.findByIds(articleIds)
        : Promise.resolve([]),
    ]);

    const projectMap = new Map(
      projects.map((project) => [project.idProyecto, project]),
    );
    const threadMap = new Map(threads.map((thread) => [thread.idHilo, thread]));
    const articleMap = new Map(
      articles.map((article) => [article.idArticulo, article]),
    );

    return saved.map((item) => {
      let titulo = 'Contenido';
      if (item.tipoContenido === TipoContenidoGuardado.PROYECTO) {
        titulo = projectMap.get(item.idContenido)?.titulo ?? titulo;
      }
      if (item.tipoContenido === TipoContenidoGuardado.HILO) {
        titulo = threadMap.get(item.idContenido)?.titulo ?? titulo;
      }
      if (item.tipoContenido === TipoContenidoGuardado.ARTICULO) {
        titulo = articleMap.get(item.idContenido)?.titulo ?? titulo;
      }

      return {
        idGuardado: item.idGuardado,
        tipoContenido: item.tipoContenido,
        idContenido: item.idContenido,
        titulo,
        fechaGuardado: item.fechaGuardado,
      };
    });
  }

  async saveMaterial(
    userId: number,
    payload: SaveMaterialDto,
  ): Promise<MaterialGuardadoEntity> {
    const existing = await this.savedRepository.findOne({
      where: {
        idUsuario: userId,
        tipoContenido: payload.tipoContenido,
        idContenido: payload.idContenido,
      },
    });

    if (existing) {
      return existing;
    }

    const saved = this.savedRepository.create({
      idUsuario: userId,
      tipoContenido: payload.tipoContenido,
      idContenido: payload.idContenido,
    });

    return this.savedRepository.save(saved);
  }

  async removeSavedMaterial(userId: number, idGuardado: number) {
    const saved = await this.savedRepository.findOne({
      where: { idGuardado, idUsuario: userId },
    });
    if (!saved) {
      throw new NotFoundException('Registro no encontrado');
    }
    await this.savedRepository.remove(saved);
    return { deleted: true };
  }

  private toUserResponse(user: UsuarioEntity): AuthUserResponse {
    return {
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      activo: user.activo,
      carnet: user.carnet,
      semestre: user.semestre,
      fotoPerfil: user.fotoPerfil,
      roles: user.roles.map((role) => role.nombreRol),
    };
  }

  private async findUserByEmail(email: string): Promise<UsuarioEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: { roles: true },
    });
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

  private async getOrCreateDefaultRole(): Promise<RolEntity> {
    const defaultRoleName = 'ESTUDIANTE';

    const existingRole = await this.roleRepository.findOne({
      where: { nombreRol: defaultRoleName },
    });

    if (existingRole) {
      return existingRole;
    }

    const role = this.roleRepository.create({
      nombreRol: defaultRoleName,
      descripcion: 'Rol base para estudiantes',
    });

    return this.roleRepository.save(role);
  }

  private async findValidReset(
    resets: PasswordResetEntity[],
    token: string,
  ): Promise<PasswordResetEntity | null> {
    for (const reset of resets) {
      const isValid = await bcrypt.compare(token, reset.tokenHash);
      if (isValid) {
        return reset;
      }
    }
    return null;
  }
}
