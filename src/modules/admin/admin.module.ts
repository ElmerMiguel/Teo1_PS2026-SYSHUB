import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../identity/auth/jwt-auth.guard';
import { RolEntity } from '../identity/entities/rol.entity';
import { UsuarioEntity } from '../identity/entities/usuario.entity';
import { CategoriaEntity } from '../projects/entities/categoria.entity';
import { ReporteEntity } from '../social/entities/reporte.entity';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioEntity,
      RolEntity,
      CategoriaEntity,
      ReporteEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard],
})
export class AdminModule {}
