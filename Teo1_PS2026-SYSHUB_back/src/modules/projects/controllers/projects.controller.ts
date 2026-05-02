import {
  BadRequestException,
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
import {
  PaginatedProjectsResponseDto,
  ProjectCategoryResponseDto,
  ProjectResponseDto,
  ProjectTagResponseDto,
} from '../dto/project-response.dto';
import { SearchProjectsDto } from '../dto/search-projects.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsService } from '../services/projects.service';
import { ProjectsSerializer } from '../serializers/projects.serializer';
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
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.createProject(user.sub, dto);
    return ProjectsSerializer.toProjectDto(project);
  }

  @Get()
  async list(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.listProjects();
    return ProjectsSerializer.toProjectListDto(projects);
  }

  @Get('tags')
  async tags(): Promise<ProjectTagResponseDto[]> {
    const tags = await this.projectsService.listTags();
    return ProjectsSerializer.toTagListDto(tags);
  }

  @Get('categories')
  async categories(): Promise<ProjectCategoryResponseDto[]> {
    const categories = await this.projectsService.listCategories();
    return ProjectsSerializer.toCategoryListDto(categories);
  }

  @Get('curated')
  async curated(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.listCuratedProjects();
    return ProjectsSerializer.toProjectListDto(projects);
  }

  @Get('search')
  async search(
    @Query() query: SearchProjectsDto,
  ): Promise<PaginatedProjectsResponseDto> {
    const result = await this.projectsService.searchProjects(query);
    return ProjectsSerializer.toPaginatedProjectsDto(result);
  }

  @Get('me/list')
  @UseGuards(JwtAuthGuard)
  async listMine(
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.listMyProjects(user.sub);
    return ProjectsSerializer.toProjectListDto(projects);
  }

  @Get(':projectId')
  async findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.findById(projectId);
    return ProjectsSerializer.toProjectDto(project);
  }

  @Patch(':projectId')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.updateProject(
      user,
      projectId,
      dto,
    );
    return ProjectsSerializer.toProjectDto(project);
  }

  @Post(':projectId/files')
  @UseGuards(JwtAuthGuard)
  async addFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AddProjectFileDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.addFile(user, projectId, dto);
    return ProjectsSerializer.toProjectDto(project);
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
      fileFilter: (req, file, cb) => {
        const allowedMime = [
          'application/pdf',
          'application/zip',
          'application/x-zip-compressed',
          'multipart/x-zip',
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExt = ['.pdf', '.zip'];

        if (!allowedMime.includes(file.mimetype) && !allowedExt.includes(ext)) {
          return cb(
            new BadRequestException('Solo se permiten archivos .PDF o .ZIP'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProjectResponseDto> {
    if (!file) {
      const project = await this.projectsService.findById(projectId);
      return ProjectsSerializer.toProjectDto(project);
    }

    const relativePath = path.join(
      'uploads',
      'projects',
      String(projectId),
      file.filename,
    );

    const project = await this.projectsService.addFile(user, projectId, {
      nombreArchivo: file.originalname,
      rutaArchivo: relativePath,
      tipoMime: file.mimetype,
      tamanioBytes: file.size,
    });

    return ProjectsSerializer.toProjectDto(project);
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
  async deleteFile(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.deleteFile(
      user,
      projectId,
      fileId,
    );
    return ProjectsSerializer.toProjectDto(project);
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

    if (file.mime) {
      res.contentType(file.mime);
    }

    return res.download(file.path, file.filename, (err) => {
      if (err) {
        res.status(404).send({ message: 'Archivo no encontrado' });
      }
    });
  }

  @Post(':projectId/views')
  @UseGuards(JwtAuthGuard)
  registerView(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectsService.registerProjectView(user, projectId);
  }

  @Post(':projectId/curate')
  @UseGuards(JwtAuthGuard)
  async curate(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CurateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.curateProject(
      user,
      projectId,
      dto,
    );
    return ProjectsSerializer.toProjectDto(project);
  }
}
