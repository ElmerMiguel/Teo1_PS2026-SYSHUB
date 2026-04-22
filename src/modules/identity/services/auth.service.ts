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
import { Repository } from 'typeorm';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { RolEntity } from '../entities/rol.entity';
import { UsuarioEntity } from '../entities/usuario.entity';

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
  accessToken: string;
  user: AuthUserResponse;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly userRepository: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly roleRepository: Repository<RolEntity>,
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
      activo: true,
    });

    const savedUser = await this.userRepository.save(user);
    const defaultRole = await this.getOrCreateDefaultRole();

    savedUser.roles = [defaultRole];
    await this.userRepository.save(savedUser);

    const userWithRoles = await this.findUserById(savedUser.idUsuario);
    return this.buildAuthResponse(userWithRoles);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.findUserByEmail(loginDto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('La cuenta está inactiva');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: number): Promise<AuthUserResponse> {
    const user = await this.findUserById(userId);
    return this.toUserResponse(user);
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
}
