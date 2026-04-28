import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { EstadoReporte } from '../../social/entities/reporte.entity';
import { EstadoModeracionAdmin } from '../dto/moderate-report.dto';
import { AdminService } from './admin.service';

type RepoMock = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: RepoMock;
  let roleRepository: RepoMock;
  let categoryRepository: RepoMock;
  let reportRepository: RepoMock;

  const adminUser: JwtPayload = {
    sub: 1,
    email: 'admin@test.com',
    roles: ['ADMIN'],
  };

  const studentUser: JwtPayload = {
    sub: 2,
    email: 'student@test.com',
    roles: ['ESTUDIANTE'],
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    roleRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    categoryRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    reportRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new AdminService(
      userRepository as never,
      roleRepository as never,
      categoryRepository as never,
      reportRepository as never,
    );
  });

  it('assigns a role to user as admin', async () => {
    userRepository.findOne.mockResolvedValue({ idUsuario: 3, roles: [] });
    roleRepository.findOne.mockResolvedValue({
      idRol: 10,
      nombreRol: 'MODERADOR',
    });
    userRepository.save.mockImplementation((payload: { roles: unknown[] }) =>
      Promise.resolve(payload),
    );

    const result = await service.assignRole(adminUser, 3, {
      nombreRol: 'moderador',
    });

    expect(result.roles).toHaveLength(1);
  });

  it('rejects assigning role when requester is not admin', async () => {
    await expect(
      service.assignRole(studentUser, 3, { nombreRol: 'ADMIN' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('moderates pending report and sets moderator id', async () => {
    reportRepository.findOne.mockResolvedValue({
      idReporte: 9,
      estado: EstadoReporte.PENDIENTE,
    });
    reportRepository.save.mockImplementation(
      (payload: { estado: EstadoReporte; idModerador: number }) =>
        Promise.resolve(payload),
    );

    const result = await service.moderateReport(adminUser, 9, {
      estado: EstadoModeracionAdmin.RESUELTO,
    });

    expect(result.estado).toBe(EstadoReporte.RESUELTO);
    expect(result.idModerador).toBe(1);
  });

  it('throws not found when deleting unknown category', async () => {
    categoryRepository.findOne.mockResolvedValue(null);

    await expect(service.deleteCategory(adminUser, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
