import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { EstadoArticulo } from '../entities/articulo.entity';
import { EstadoReporteModeracion } from '../dto/update-report-status.dto';
import { EstadoReporte } from '../entities/reporte.entity';
import { TipoValoracion } from '../entities/valoracion.entity';
import { SocialService } from './social.service';

type RepoMock = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('SocialService', () => {
  let service: SocialService;
  let threadRepository: RepoMock;
  let articleRepository: RepoMock;
  let commentRepository: RepoMock;
  let voteRepository: RepoMock;
  let reportRepository: RepoMock;
  let userRepository: RepoMock;
  let categoryRepository: RepoMock;
  let projectRepository: RepoMock;

  const student: JwtPayload = {
    sub: 1,
    email: 'student@test.com',
    roles: ['ESTUDIANTE'],
  };

  beforeEach(() => {
    threadRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    articleRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    commentRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    voteRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    reportRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    categoryRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    projectRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new SocialService(
      threadRepository as never,
      articleRepository as never,
      commentRepository as never,
      voteRepository as never,
      reportRepository as never,
      userRepository as never,
      categoryRepository as never,
      projectRepository as never,
    );
  });

  it('creates thread with valid user and category', async () => {
    userRepository.findOne.mockResolvedValue({ idUsuario: 1 });
    categoryRepository.findOne.mockResolvedValue({ idCategoria: 2 });
    threadRepository.save.mockResolvedValue({ idHilo: 10 });
    jest
      .spyOn(service, 'getThreadById')
      .mockResolvedValue({ idHilo: 10 } as never);

    const result = await service.createThread(student, {
      titulo: 'Duda de grafos',
      contenido: 'Tengo una duda sobre Dijkstra en grafos pesados',
      idCategoria: 2,
    });

    expect(threadRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ idHilo: 10 });
  });

  it('rejects article creation for non auxiliar/admin', async () => {
    await expect(
      service.createArticle(student, {
        titulo: 'Articulo',
        contenidoHtml: '<p>Contenido suficientemente largo para artículo</p>',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates vote and returns score', async () => {
    userRepository.findOne.mockResolvedValue({ idUsuario: 1 });
    jest
      .spyOn(service, 'getThreadById')
      .mockResolvedValue({ idHilo: 5 } as never);
    voteRepository.findOne.mockResolvedValue(null);
    voteRepository.create.mockReturnValue({
      idValoracion: 7,
      tipo: TipoValoracion.UPVOTE,
    });
    voteRepository.find.mockResolvedValue([
      { tipo: TipoValoracion.UPVOTE },
      { tipo: TipoValoracion.DOWNVOTE },
      { tipo: TipoValoracion.UPVOTE },
    ]);

    const result = await service.vote(student, {
      tipo: TipoValoracion.UPVOTE,
      idHilo: 5,
    });

    expect(result.score).toBe(1);
    expect(voteRepository.save).toHaveBeenCalled();
  });

  it('rejects report when project target does not exist', async () => {
    userRepository.findOne.mockResolvedValue({ idUsuario: 1 });
    projectRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createReport(student, {
        razon: 'spam',
        idProyecto: 999,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns ranked thread comments by score desc', async () => {
    jest
      .spyOn(service, 'getThreadById')
      .mockResolvedValue({ idHilo: 3 } as never);
    commentRepository.find.mockResolvedValue([
      { idComentario: 1, contenido: 'A' },
      { idComentario: 2, contenido: 'B' },
    ]);
    voteRepository.find.mockResolvedValue([
      { idComentario: 1, tipo: TipoValoracion.UPVOTE },
      { idComentario: 1, tipo: TipoValoracion.UPVOTE },
      { idComentario: 2, tipo: TipoValoracion.DOWNVOTE },
    ]);

    const ranked = await service.listThreadCommentsRanked(3);

    expect(ranked[0].comment.idComentario).toBe(1);
    expect(ranked[0].score).toBe(2);
    expect(ranked[1].score).toBe(-1);
  });

  it('creates article for auxiliar role', async () => {
    userRepository.findOne.mockResolvedValue({ idUsuario: 2 });
    articleRepository.save.mockResolvedValue({
      idArticulo: 4,
      estado: EstadoArticulo.PUBLICADO,
    });

    const result = await service.createArticle(
      { ...student, sub: 2, roles: ['AUXILIAR'] },
      {
        titulo: 'Guía NestJS',
        contenidoHtml: '<p>Contenido extenso de guía técnica</p>',
        estado: EstadoArticulo.PUBLICADO,
      },
    );

    expect(result).toEqual({ idArticulo: 4, estado: EstadoArticulo.PUBLICADO });
  });

  it('forbids report listing for non moderator/admin roles', async () => {
    await expect(service.listReports(student, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('updates report status to resolved and sets moderator', async () => {
    reportRepository.findOne.mockResolvedValue({
      idReporte: 12,
      estado: EstadoReporte.PENDIENTE,
    });
    reportRepository.save.mockImplementation(
      (report: {
        idReporte: number;
        estado: EstadoReporte;
        idModerador?: number;
      }) => Promise.resolve(report),
    );

    const result = await service.updateReportStatus(
      { ...student, sub: 99, roles: ['ADMIN'] },
      12,
      { estado: EstadoReporteModeracion.RESUELTO },
    );

    expect(result.estado).toBe(EstadoReporte.RESUELTO);
    expect(result.idModerador).toBe(99);
  });

  it('rejects moderating a report already moderated', async () => {
    reportRepository.findOne.mockResolvedValue({
      idReporte: 15,
      estado: EstadoReporte.DESESTIMADO,
    });

    const action = service.updateReportStatus(
      { ...student, roles: ['ADMIN'] },
      15,
      { estado: EstadoReporteModeracion.RESUELTO },
    );

    await expect(action).rejects.toThrow('El reporte ya fue moderado');
  });
});
