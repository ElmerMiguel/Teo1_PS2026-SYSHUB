import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/modules/identity/auth/jwt-auth.guard';
import { AdminController } from '../src/modules/admin/controllers/admin.controller';
import { AdminService } from '../src/modules/admin/services/admin.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication<App>;

  const adminServiceMock: Partial<Record<keyof AdminService, jest.Mock>> = {
    listUsers: jest.fn(),
    setUserActive: jest.fn(),
    createCategory: jest.fn(),
    listReports: jest.fn(),
  };

  let authUser: { sub: number; email: string; roles: string[] } = {
    sub: 1,
    email: 'admin@test.com',
    roles: ['ADMIN'],
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
      email: 'admin@test.com',
      roles: ['ADMIN'],
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: adminServiceMock,
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

  it('GET /api/admin/users returns paginated users', async () => {
    adminServiceMock.listUsers?.mockResolvedValue({
      items: [{ idUsuario: 1, email: 'admin@test.com' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    await request(app.getHttpServer())
      .get('/api/admin/users?page=1&limit=10')
      .expect(200)
      .expect((res) => {
        const body = res.body as { total: number };
        expect(body.total).toBe(1);
      });
  });

  it('PATCH /api/admin/users/:id/active validates payload', async () => {
    await request(app.getHttpServer())
      .patch('/api/admin/users/2/active')
      .send({ activo: 'si' })
      .expect(400);
  });

  it('POST /api/admin/users/:id/suspensions validates payload', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/users/2/suspensions')
      .send({ razon: 'no' })
      .expect(400);
  });

  it('POST /api/admin/categories returns 403 when service rejects by role', async () => {
    authUser = {
      sub: 2,
      email: 'student@test.com',
      roles: ['ESTUDIANTE'],
    };
    adminServiceMock.createCategory?.mockRejectedValue(
      new ForbiddenException('Solo ADMIN puede realizar esta acción'),
    );

    await request(app.getHttpServer())
      .post('/api/admin/categories')
      .send({ nombre: 'IA', areaTecnica: 'IA' })
      .expect(403);
  });

  it('GET /api/admin/moderation/reports accepts estado filter', async () => {
    adminServiceMock.listReports?.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await request(app.getHttpServer())
      .get('/api/admin/moderation/reports?estado=pendiente')
      .expect(200);
  });
});
