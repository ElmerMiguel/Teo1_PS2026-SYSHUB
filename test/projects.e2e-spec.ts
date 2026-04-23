import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ProjectsController } from '../src/modules/projects/controllers/projects.controller';
import { JwtAuthGuard } from '../src/modules/identity/auth/jwt-auth.guard';
import { ProjectsService } from '../src/modules/projects/services/projects.service';
import { EstadoProyecto } from '../src/modules/projects/entities/proyecto.entity';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication<App>;

  const projectsServiceMock: Partial<Record<keyof ProjectsService, jest.Mock>> =
    {
      createProject: jest.fn(),
      listProjects: jest.fn(),
      searchProjects: jest.fn(),
      deleteProject: jest.fn(),
    };

  const guardMock = {
    canActivate: (
      context: Parameters<NonNullable<JwtAuthGuard['canActivate']>>[0],
    ) => {
      const req = context.switchToHttp().getRequest<{
        user?: { sub: number; email: string; roles: string[] };
      }>();
      req.user = { sub: 1, email: 'student@test.com', roles: ['ESTUDIANTE'] };
      return true;
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: projectsServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(guardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/projects should return list', async () => {
    projectsServiceMock.listProjects?.mockResolvedValue([
      {
        idProyecto: 10,
        titulo: 'Proyecto A',
        descripcion: 'Descripcion de prueba suficientemente larga',
        stackTecnologico: { backend: 'nestjs' },
        fechaPublicacion: new Date(),
        estado: EstadoProyecto.BORRADOR,
        idUsuario: 1,
        vistas: 0,
        etiquetas: [],
      },
    ]);

    await request(app.getHttpServer()).get('/api/projects').expect(200);
  });

  it('POST /api/projects should create project (guarded route)', async () => {
    projectsServiceMock.createProject?.mockResolvedValue({
      idProyecto: 20,
      titulo: 'Proyecto B',
      descripcion: 'Descripcion de prueba suficientemente larga',
      stackTecnologico: { backend: 'nestjs' },
      fechaPublicacion: new Date(),
      estado: EstadoProyecto.BORRADOR,
      idUsuario: 1,
      vistas: 0,
      etiquetas: [],
    });

    await request(app.getHttpServer())
      .post('/api/projects')
      .send({
        titulo: 'Proyecto B',
        descripcion: 'Descripcion de prueba suficientemente larga',
        stackTecnologico: { backend: 'nestjs' },
        etiquetas: ['nestjs'],
      })
      .expect(201);

    expect(projectsServiceMock.createProject).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ titulo: 'Proyecto B' }),
    );
  });

  it('GET /api/projects/search should validate query params', async () => {
    await request(app.getHttpServer())
      .get('/api/projects/search?limit=200')
      .expect(400);
  });

  it('DELETE /api/projects/:projectId should delete project', async () => {
    projectsServiceMock.deleteProject?.mockResolvedValue({ deleted: true });

    await request(app.getHttpServer()).delete('/api/projects/9').expect(200);

    expect(projectsServiceMock.deleteProject).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1 }),
      9,
    );
  });
});
