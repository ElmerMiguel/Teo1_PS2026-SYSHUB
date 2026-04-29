import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../identity/auth/jwt-auth.guard';
import { RolEntity } from '../identity/entities/rol.entity';
import { SesionEntity } from '../identity/entities/sesion.entity';
import { UsuarioEntity } from '../identity/entities/usuario.entity';
import { CategoriaEntity } from '../projects/entities/categoria.entity';
import { ProyectoEntity } from '../projects/entities/proyecto.entity';
import { ArticuloEntity } from '../social/entities/articulo.entity';
import { ComentarioEntity } from '../social/entities/comentario.entity';
import { HiloForoEntity } from '../social/entities/hilo-foro.entity';
import { ReporteEntity } from '../social/entities/reporte.entity';
import { AdminController } from './controllers/admin.controller';
import { AdminAuditEntity } from './entities/admin-audit.entity';
import { UsuarioSuspensionEntity } from './entities/usuario-suspension.entity';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioEntity,
      RolEntity,
      SesionEntity,
      CategoriaEntity,
      ProyectoEntity,
      ArticuloEntity,
      ComentarioEntity,
      HiloForoEntity,
      ReporteEntity,
      AdminAuditEntity,
      UsuarioSuspensionEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard],
})
export class AdminModule {}
