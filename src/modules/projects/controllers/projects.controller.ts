import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/current-user.decorator';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { AddProjectFileDto } from '../dto/add-project-file.dto';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CurateProjectDto } from '../dto/curate-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsService } from '../services/projects.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(user.sub, dto);
  }

  @Get()
  list() {
    return this.projectsService.listProjects();
  }

  @Get('tags')
  tags() {
    return this.projectsService.listTags();
  }

  @Get('categories')
  categories() {
    return this.projectsService.listCategories();
  }

  @Get('curated')
  curated() {
    return this.projectsService.listCuratedProjects();
  }

  @Get('search')
  search(
    @Query('tag') tag?: string,
    @Query('categoryId') categoryId?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.searchProjects({
      tag,
      categoryId: categoryId ? Number(categoryId) : undefined,
      q,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('me/list')
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUser() user: JwtPayload) {
    return this.projectsService.listMyProjects(user.sub);
  }

  @Get(':projectId')
  findOne(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectsService.findById(projectId);
  }

  @Patch(':projectId')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(user, projectId, dto);
  }

  @Post(':projectId/files')
  @UseGuards(JwtAuthGuard)
  addFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AddProjectFileDto,
  ) {
    return this.projectsService.addFile(user, projectId, dto);
  }

  @Post(':projectId/files/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const projectId = req.params.projectId;
          const uploadPath = path.join(
            process.cwd(),
            'uploads',
            'projects',
            String(projectId),
          );
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          cb(null, `${timestamp}_${safe}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    }),
  )
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return this.projectsService.findById(projectId);

    const relativePath = path.join(
      'uploads',
      'projects',
      String(projectId),
      file.filename,
    );

    await this.projectsService.addFile(user, projectId, {
      nombreArchivo: file.originalname,
      rutaArchivo: relativePath,
      tipoMime: file.mimetype,
      tamanioBytes: file.size,
    });

    return this.projectsService.findById(projectId);
  }

  @Delete(':projectId')
  @UseGuards(JwtAuthGuard)
  deleteProject(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectsService.deleteProject(user, projectId);
  }

  @Delete(':projectId/files/:fileId')
  @UseGuards(JwtAuthGuard)
  deleteFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ) {
    return this.projectsService.deleteFile(user, projectId, fileId);
  }

  @Get(':projectId/files/:fileId/download')
  @UseGuards(JwtAuthGuard)
  async downloadFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
  ) {
    const file = await this.projectsService.getFile(user, projectId, fileId);
    return res.sendFile(file.path, (err) => {
      if (err) {
        res.status(404).send({ message: 'Archivo no encontrado' });
      }
    });
  }

  @Post(':projectId/curate')
  @UseGuards(JwtAuthGuard)
  curate(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CurateProjectDto,
  ) {
    return this.projectsService.curateProject(user, projectId, dto);
  }
}
