import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../identity/auth/jwt-auth.guard';
import { UsuarioEntity } from '../identity/entities/usuario.entity';
import { CategoriaEntity } from '../projects/entities/categoria.entity';
import { ProyectoEntity } from '../projects/entities/proyecto.entity';
import { SocialController } from './controllers/social.controller';
import { ArticuloEntity } from './entities/articulo.entity';
import { ComentarioEntity } from './entities/comentario.entity';
import { HiloForoEntity } from './entities/hilo-foro.entity';
import { ReporteEntity } from './entities/reporte.entity';
import { ValoracionEntity } from './entities/valoracion.entity';
import { SocialService } from './services/social.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HiloForoEntity,
      ArticuloEntity,
      ComentarioEntity,
      ValoracionEntity,
      ReporteEntity,
      UsuarioEntity,
      CategoriaEntity,
      ProyectoEntity,
    ]),
  ],
  controllers: [SocialController],
  providers: [SocialService, JwtAuthGuard],
  exports: [SocialService],
})
export class SocialModule {}
