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
  update?: jest.Mock;
};

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: RepoMock;
  let roleRepository: RepoMock;
  let sessionRepository: RepoMock;
  let categoryRepository: RepoMock;
  let projectRepository: RepoMock;
  let articleRepository: RepoMock;
  let commentRepository: RepoMock;
  let threadRepository: RepoMock;
  let reportRepository: RepoMock;
  let auditRepository: RepoMock;
  let suspensionRepository: RepoMock;

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

    sessionRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
    };

    categoryRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    projectRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    articleRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    commentRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    threadRepository = {
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

    auditRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    suspensionRepository = {
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
      sessionRepository as never,
      categoryRepository as never,
      projectRepository as never,
      articleRepository as never,
      commentRepository as never,
      threadRepository as never,
      reportRepository as never,
      auditRepository as never,
      suspensionRepository as never,
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

  it('suspends user and registers suspension record', async () => {
    userRepository.findOne.mockResolvedValue({
      idUsuario: 10,
      activo: true,
      roles: [],
    });
    suspensionRepository.findOne.mockResolvedValue(null);
    userRepository.save.mockImplementation((payload: { activo: boolean }) =>
      Promise.resolve(payload),
    );
    suspensionRepository.create.mockReturnValue({ idSuspension: 5 });
    suspensionRepository.save.mockResolvedValue({
      idSuspension: 5,
      activo: true,
    });

    const result = await service.createSuspension(adminUser, 10, {
      razon: 'Spam reiterado',
    });

    expect(sessionRepository.update).toHaveBeenCalled();
    expect(result.idSuspension).toBe(5);
  });

  it('soft deletes a comment as moderator', async () => {
    commentRepository.findOne.mockResolvedValue({
      idComentario: 4,
      eliminado: false,
    });
    commentRepository.save.mockImplementation(
      (payload: { eliminado: boolean }) => Promise.resolve(payload),
    );

    await service.deleteComment({ ...adminUser, roles: ['MODERADOR'] }, 4);

    expect(commentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ eliminado: true }),
    );
  });
});
