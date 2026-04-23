import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { EstadoProyecto } from '../entities/proyecto.entity';
import type { JwtPayload } from '../../identity/auth/jwt-payload.interface';

type RepoMock = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: RepoMock;
  let fileRepository: RepoMock;
  let curationRepository: RepoMock;
  let categoryRepository: RepoMock;
  let tagRepository: RepoMock;
  let userRepository: RepoMock;

  const ownerUser: JwtPayload = {
    sub: 1,
    email: 'owner@test.com',
    roles: ['ESTUDIANTE'],
  };

  beforeEach(() => {
    projectRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    fileRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    curationRepository = {
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

    tagRepository = {
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

    service = new ProjectsService(
      projectRepository as never,
      fileRepository as never,
      curationRepository as never,
      categoryRepository as never,
      tagRepository as never,
      userRepository as never,
    );
  });

  it('should reject creating project directly in PUBLICADO state', async () => {
    await expect(
      service.createProject(ownerUser.sub, {
        titulo: 'Proyecto x',
        descripcion: 'descripcion suficientemente larga',
        stackTecnologico: { backend: 'nestjs' },
        etiquetas: ['nestjs'],
        estado: EstadoProyecto.PUBLICADO,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(projectRepository.save).not.toHaveBeenCalled();
  });

  it('should reject publishing project without attachments', async () => {
    const project = {
      idProyecto: 1,
      idUsuario: ownerUser.sub,
      titulo: 'Proyecto',
      descripcion: 'descripcion suficientemente larga',
      stackTecnologico: { backend: 'nestjs' },
      etiquetas: [{ idEtiqueta: 1, nombre: 'nestjs', color: '#000000' }],
      estado: EstadoProyecto.BORRADOR,
    };

    jest.spyOn(service, 'findById').mockResolvedValue(project as never);
    fileRepository.count.mockResolvedValue(0);

    await expect(
      service.updateProject(ownerUser, 1, { estado: EstadoProyecto.PUBLICADO }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject curation for non AUXILIAR/ADMIN roles', async () => {
    await expect(
      service.curateProject({ ...ownerUser, roles: ['ESTUDIANTE'] }, 1, {
        comentarioAuxiliar: 'destacado',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject downloading private file for non owner/non admin', async () => {
    fileRepository.findOne.mockResolvedValue({
      idArchivo: 10,
      idProyecto: 2,
      nombreArchivo: 'archivo.pdf',
      rutaArchivo: 'uploads/projects/2/archivo.pdf',
      tipoMime: 'application/pdf',
      proyecto: {
        idUsuario: 99,
        estado: EstadoProyecto.BORRADOR,
      },
    });

    await expect(
      service.getFile(
        { sub: 3, email: 'x@test.com', roles: ['ESTUDIANTE'] },
        2,
        10,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should delete file metadata and return updated project', async () => {
    fileRepository.findOne.mockResolvedValue({
      idArchivo: 7,
      idProyecto: 3,
      rutaArchivo: 'uploads/projects/3/a.zip',
      proyecto: { idUsuario: ownerUser.sub },
    });
    fileRepository.delete.mockResolvedValue({ affected: 1 });

    const updatedProject = { idProyecto: 3, titulo: 'Proyecto actualizado' };
    jest.spyOn(service, 'findById').mockResolvedValue(updatedProject as never);

    const result = await service.deleteFile(ownerUser, 3, 7);

    expect(fileRepository.delete).toHaveBeenCalledWith({ idArchivo: 7 });
    expect(result).toEqual(updatedProject);
  });
});
