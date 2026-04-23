import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../identity/auth/jwt-auth.guard';
import { UsuarioEntity } from '../identity/entities/usuario.entity';
import { ProjectsController } from './controllers/projects.controller';
import { ArchivoProyectoEntity } from './entities/archivo-proyecto.entity';
import { CategoriaEntity } from './entities/categoria.entity';
import { CuraduriaEntity } from './entities/curaduria.entity';
import { EtiquetaEntity } from './entities/etiqueta.entity';
import { ProyectoEntity } from './entities/proyecto.entity';
import { ProyectoVistaEntity } from './entities/proyecto-vista.entity';
import { ProjectsService } from './services/projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProyectoEntity,
      ArchivoProyectoEntity,
      CuraduriaEntity,
      CategoriaEntity,
      EtiquetaEntity,
      ProyectoVistaEntity,
      UsuarioEntity,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtAuthGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
