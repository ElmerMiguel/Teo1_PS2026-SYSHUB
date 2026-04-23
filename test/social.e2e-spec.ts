import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/modules/identity/auth/jwt-auth.guard';
import { EstadoReporte } from '../src/modules/social/entities/reporte.entity';
import { SocialController } from '../src/modules/social/controllers/social.controller';
import { EstadoHilo } from '../src/modules/social/entities/hilo-foro.entity';
import { SocialService } from '../src/modules/social/services/social.service';

describe('SocialController (e2e)', () => {
  let app: INestApplication<App>;

  const socialServiceMock: Partial<Record<keyof SocialService, jest.Mock>> = {
    createThread: jest.fn(),
    listThreads: jest.fn(),
    vote: jest.fn(),
    createReport: jest.fn(),
    listReports: jest.fn(),
    updateReportStatus: jest.fn(),
  };

  let authUser: { sub: number; email: string; roles: string[] } = {
    sub: 1,
    email: 'student@test.com',
    roles: ['ESTUDIANTE'],
  };

  const guardMock = {
    canActivate: (
      context: Parameters<NonNullable<JwtAuthGuard['canActivate']>>[0],
    ) => {
      const req = context.switchToHttp().getRequest<{
        user?: { sub: number; email: string; roles: string[] };
      }>();
      req.user = authUser;
      return true;
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    authUser = {
      sub: 1,
      email: 'student@test.com',
      roles: ['ESTUDIANTE'],
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SocialController],
      providers: [
        {
          provide: SocialService,
          useValue: socialServiceMock,
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

  it('POST /api/social/threads should create a thread', async () => {
    socialServiceMock.createThread?.mockResolvedValue({
      idHilo: 1,
      titulo: 'Hilo de prueba',
      contenido: 'Contenido suficiente para hilo',
      fechaCreacion: new Date(),
      idUsuario: 1,
      estado: EstadoHilo.ABIERTO,
      vistas: 0,
      fijado: false,
    });

    await request(app.getHttpServer())
      .post('/api/social/threads')
      .send({
        titulo: 'Hilo de prueba',
        contenido: 'Contenido suficiente para hilo',
      })
      .expect(201);

    expect(socialServiceMock.createThread).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1 }),
      expect.objectContaining({ titulo: 'Hilo de prueba' }),
    );
  });

  it('GET /api/social/threads should return paginated list', async () => {
    socialServiceMock.listThreads?.mockResolvedValue({
      items: [
        {
          idHilo: 2,
          titulo: 'Consulta',
          contenido: 'Contenido de consulta',
          fechaCreacion: new Date(),
          idUsuario: 1,
          estado: EstadoHilo.ABIERTO,
          vistas: 3,
          fijado: false,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });

    await request(app.getHttpServer())
      .get('/api/social/threads?page=1&limit=10')
      .expect(200);
  });

  it('POST /api/social/votes validates single target', async () => {
    await request(app.getHttpServer())
      .post('/api/social/votes')
      .send({ tipo: 'upvote' })
      .expect(400);
  });

  it('POST /api/social/reports validates single target', async () => {
    await request(app.getHttpServer())
      .post('/api/social/reports')
      .send({ razon: 'spam', idHilo: 1, idComentario: 2 })
      .expect(400);
  });

  it('GET /api/social/reports returns 403 for non moderator/admin', async () => {
    socialServiceMock.listReports?.mockRejectedValue(
      new ForbiddenException('Solo MODERADOR o ADMIN pueden moderar reportes'),
    );

    await request(app.getHttpServer()).get('/api/social/reports').expect(403);
  });

  it('PATCH /api/social/reports/:id/status updates report status for admin', async () => {
    authUser = { sub: 99, email: 'admin@test.com', roles: ['ADMIN'] };
    socialServiceMock.updateReportStatus?.mockResolvedValue({
      idReporte: 3,
      razon: 'spam',
      fechaReporte: new Date(),
      estado: EstadoReporte.RESUELTO,
      idReportador: 1,
      idModerador: 99,
    });

    await request(app.getHttpServer())
      .patch('/api/social/reports/3/status')
      .send({ estado: EstadoReporte.RESUELTO })
      .expect(200)
      .expect((res) => {
        const body = res.body as { estado: string; idModerador: number };
        expect(body.estado).toBe(EstadoReporte.RESUELTO);
        expect(body.idModerador).toBe(99);
      });
  });
});
