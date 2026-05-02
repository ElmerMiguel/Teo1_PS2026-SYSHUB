import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { MaterialGuardadoEntity } from './entities/material-guardado.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { RolEntity } from './entities/rol.entity';
import { SesionEntity } from './entities/sesion.entity';
import { UsuarioEntity } from './entities/usuario.entity';
import { AuthService } from './services/auth.service';
import { ProyectoEntity } from '../projects/entities/proyecto.entity';
import { HiloForoEntity } from '../social/entities/hilo-foro.entity';
import { ComentarioEntity } from '../social/entities/comentario.entity';
import { ArticuloEntity } from '../social/entities/articulo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioEntity,
      RolEntity,
      SesionEntity,
      MaterialGuardadoEntity,
      PasswordResetEntity,
      ProyectoEntity,
      HiloForoEntity,
      ComentarioEntity,
      ArticuloEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'change_me',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService],
})
export class IdentityModule {}
