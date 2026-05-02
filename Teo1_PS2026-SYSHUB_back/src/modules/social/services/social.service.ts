import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { UsuarioEntity } from '../../identity/entities/usuario.entity';
import { CategoriaEntity } from '../../projects/entities/categoria.entity';
import { ProyectoEntity } from '../../projects/entities/proyecto.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReportDto } from '../dto/create-report.dto';
import { CreateThreadDto } from '../dto/create-thread.dto';
import { ListReportsDto } from '../dto/list-reports.dto';
import { ListSocialDto } from '../dto/list-social.dto';
import {
  EstadoReporteModeracion,
  UpdateReportStatusDto,
} from '../dto/update-report-status.dto';
import { VoteDto } from '../dto/vote.dto';
import { ArticuloEntity, EstadoArticulo } from '../entities/articulo.entity';
import { ComentarioEntity } from '../entities/comentario.entity';
import { EstadoHilo, HiloForoEntity } from '../entities/hilo-foro.entity';
import { EstadoReporte, ReporteEntity } from '../entities/reporte.entity';
import {
  TipoValoracion,
  ValoracionEntity,
} from '../entities/valoracion.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(HiloForoEntity)
    private readonly threadRepository: Repository<HiloForoEntity>,
    @InjectRepository(ArticuloEntity)
    private readonly articleRepository: Repository<ArticuloEntity>,
    @InjectRepository(ComentarioEntity)
    private readonly commentRepository: Repository<ComentarioEntity>,
    @InjectRepository(ValoracionEntity)
    private readonly voteRepository: Repository<ValoracionEntity>,
    @InjectRepository(ReporteEntity)
    private readonly reportRepository: Repository<ReporteEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly userRepository: Repository<UsuarioEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoryRepository: Repository<CategoriaEntity>,
    @InjectRepository(ProyectoEntity)
    private readonly projectRepository: Repository<ProyectoEntity>,
  ) {}

  async createThread(user: JwtPayload, dto: CreateThreadDto) {
    await this.ensureUserExists(user.sub);
    await this.ensureCategoryExists(dto.idCategoria);

    const thread = this.threadRepository.create({
      titulo: dto.titulo,
      contenido: dto.contenido,
      idUsuario: user.sub,
      idCategoria: dto.idCategoria,
      estado: EstadoHilo.ABIERTO,
    });

    const saved = await this.threadRepository.save(thread);
    return this.getThreadById(saved.idHilo);
  }

  async listThreads(query: ListSocialDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.threadRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.usuario', 'u')
      .leftJoinAndSelect('h.categoria', 'cat')
      .orderBy('h.fijado', 'DESC')
      .addOrderBy('h.fechaCreacion', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.idCategoria) {
      qb.andWhere('h.idCategoria = :idCategoria', {
        idCategoria: query.idCategoria,
      });
    }

    if (query.q) {
      qb.andWhere('(h.titulo ILIKE :q OR h.contenido ILIKE :q)', {
        q: `%${query.q}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    const scoresById = await this.getScoresByField(
      'idHilo',
      items.map((item) => item.idHilo),
    );
    return { items, total, page, limit, scoresById };
  }

  async getThreadById(idHilo: number) {
    const thread = await this.threadRepository.findOne({
      where: { idHilo },
      relations: { categoria: true, usuario: true },
    });

    if (!thread) {
      throw new NotFoundException('Hilo no encontrado');
    }

    return thread;
  }

  async getThreadWithScore(idHilo: number) {
    const thread = await this.getThreadById(idHilo);
    const score = (await this.getScoresByField('idHilo', [idHilo])).get(
      idHilo,
    );

    return { thread, score: score ?? 0 };
  }

  async createArticle(user: JwtPayload, dto: CreateArticleDto) {
    if (!this.hasArticleAuthorRole(user.roles)) {
      throw new ForbiddenException(
        'Solo AUXILIAR o ADMIN pueden publicar artículos',
      );
    }

    await this.ensureUserExists(user.sub);

    const article = this.articleRepository.create({
      titulo: dto.titulo,
      contenidoHtml: dto.contenidoHtml,
      resumen: dto.resumen,
      imagenPortada: dto.imagenPortada,
      estado: dto.estado ?? EstadoArticulo.BORRADOR,
      idAutor: user.sub,
    });

    return this.articleRepository.save(article);
  }

  async listArticles(query: ListSocialDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.articleRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.autor', 'autor')
      .orderBy('a.fechaPublicacion', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.q) {
      qb.andWhere('(a.titulo ILIKE :q OR a.resumen ILIKE :q)', {
        q: `%${query.q}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    const scoresById = await this.getScoresByField(
      'idArticulo',
      items.map((item) => item.idArticulo),
    );
    return { items, total, page, limit, scoresById };
  }

  async getArticleById(idArticulo: number) {
    const article = await this.articleRepository.findOne({
      where: { idArticulo },
      relations: { autor: true },
    });

    if (!article) {
      throw new NotFoundException('Artículo no encontrado');
    }

    return article;
  }

  async getArticleWithScore(idArticulo: number) {
    const article = await this.getArticleById(idArticulo);
    const score = (await this.getScoresByField('idArticulo', [idArticulo])).get(
      idArticulo,
    );

    return { article, score: score ?? 0 };
  }

  async createThreadComment(
    user: JwtPayload,
    idHilo: number,
    dto: CreateCommentDto,
  ) {
    await this.ensureUserExists(user.sub);
    await this.getThreadById(idHilo);
    await this.ensureParentCommentConsistency(dto.idComentarioPadre, {
      idHilo,
    });

    const comment = this.commentRepository.create({
      contenido: dto.contenido,
      idUsuario: user.sub,
      idHilo,
      idComentarioPadre: dto.idComentarioPadre,
    });

    return this.commentRepository.save(comment);
  }

  async createArticleComment(
    user: JwtPayload,
    idArticulo: number,
    dto: CreateCommentDto,
  ) {
    await this.ensureUserExists(user.sub);
    await this.getArticleById(idArticulo);
    await this.ensureParentCommentConsistency(dto.idComentarioPadre, {
      idArticulo,
    });

    const comment = this.commentRepository.create({
      contenido: dto.contenido,
      idUsuario: user.sub,
      idArticulo,
      idComentarioPadre: dto.idComentarioPadre,
    });

    return this.commentRepository.save(comment);
  }

  async listThreadComments(idHilo: number) {
    await this.getThreadById(idHilo);

    const comments = await this.commentRepository.find({
      where: { idHilo, eliminado: false },
      order: { fechaCreacion: 'ASC' },
      relations: { usuario: true },
    });
    const scoresById = await this.getScoresByField(
      'idComentario',
      comments.map((comment) => comment.idComentario),
    );

    return { items: comments, scoresById };
  }

  async listArticleComments(idArticulo: number) {
    await this.getArticleById(idArticulo);

    const comments = await this.commentRepository.find({
      where: { idArticulo, eliminado: false },
      order: { fechaCreacion: 'ASC' },
      relations: { usuario: true },
    });
    const scoresById = await this.getScoresByField(
      'idComentario',
      comments.map((comment) => comment.idComentario),
    );

    return { items: comments, scoresById };
  }

  async listThreadCommentsRanked(idHilo: number) {
    await this.getThreadById(idHilo);

    const comments = await this.commentRepository.find({
      where: { idHilo, eliminado: false },
      order: { fechaCreacion: 'ASC' },
      relations: { usuario: true },
    });

    const scoreByComment = await this.getScoresByField(
      'idComentario',
      comments.map((comment) => comment.idComentario),
    );

    return comments
      .map((comment) => ({
        comment,
        score: scoreByComment.get(comment.idComentario) ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }

  async vote(user: JwtPayload, dto: VoteDto) {
    await this.ensureUserExists(user.sub);
    await this.ensureVoteTargetExists(dto);

    const where = {
      idUsuario: user.sub,
      idHilo: dto.idHilo,
      idComentario: dto.idComentario,
      idArticulo: dto.idArticulo,
    };

    let vote = await this.voteRepository.findOne({ where });
    if (!vote) {
      vote = this.voteRepository.create({
        ...where,
        tipo: dto.tipo,
      });
    } else {
      vote.tipo = dto.tipo;
    }

    await this.voteRepository.save(vote);
    const score = await this.calculateTargetScore(dto);

    return {
      idValoracion: vote.idValoracion,
      tipo: vote.tipo,
      score,
    };
  }

  async createReport(user: JwtPayload, dto: CreateReportDto) {
    await this.ensureUserExists(user.sub);
    await this.ensureReportTargetExists(dto);

    const report = this.reportRepository.create({
      razon: dto.razon,
      descripcion: dto.descripcion,
      idReportador: user.sub,
      idHilo: dto.idHilo,
      idComentario: dto.idComentario,
      idProyecto: dto.idProyecto,
    });

    return this.reportRepository.save(report);
  }

  async listReports(user: JwtPayload, query: ListReportsDto) {
    this.ensureModeratorRole(user.roles);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.reportRepository
      .createQueryBuilder('r')
      .orderBy('r.fechaReporte', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.estado) {
      qb.andWhere('r.estado = :estado', { estado: query.estado });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async updateReportStatus(
    user: JwtPayload,
    idReporte: number,
    dto: UpdateReportStatusDto,
  ) {
    this.ensureModeratorRole(user.roles);

    const report = await this.reportRepository.findOne({
      where: { idReporte },
    });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.estado !== EstadoReporte.PENDIENTE) {
      throw new BadRequestException('El reporte ya fue moderado');
    }

    report.estado =
      dto.estado === EstadoReporteModeracion.RESUELTO
        ? EstadoReporte.RESUELTO
        : EstadoReporte.DESESTIMADO;
    report.idModerador = user.sub;

    return this.reportRepository.save(report);
  }

  private async calculateTargetScore(dto: VoteDto): Promise<number> {
    const votes = await this.voteRepository.find({
      where: {
        idHilo: dto.idHilo,
        idComentario: dto.idComentario,
        idArticulo: dto.idArticulo,
      },
    });

    return votes.reduce((acc, current) => {
      if (current.tipo === TipoValoracion.UPVOTE) return acc + 1;
      return acc - 1;
    }, 0);
  }

  private async ensureVoteTargetExists(dto: VoteDto): Promise<void> {
    if (dto.idHilo) {
      await this.getThreadById(dto.idHilo);
      return;
    }
    if (dto.idComentario) {
      const comment = await this.commentRepository.findOne({
        where: { idComentario: dto.idComentario },
      });
      if (!comment) {
        throw new NotFoundException('Comentario no encontrado');
      }
      return;
    }
    if (dto.idArticulo) {
      await this.getArticleById(dto.idArticulo);
      return;
    }

    throw new BadRequestException('Destino de valoración inválido');
  }

  private async ensureReportTargetExists(dto: CreateReportDto): Promise<void> {
    if (dto.idHilo) {
      await this.getThreadById(dto.idHilo);
      return;
    }
    if (dto.idComentario) {
      const comment = await this.commentRepository.findOne({
        where: { idComentario: dto.idComentario },
      });
      if (!comment) {
        throw new NotFoundException('Comentario no encontrado');
      }
      return;
    }
    if (dto.idProyecto) {
      const project = await this.projectRepository.findOne({
        where: { idProyecto: dto.idProyecto },
      });
      if (!project) {
        throw new NotFoundException('Proyecto no encontrado');
      }
      return;
    }

    throw new BadRequestException('Destino de reporte inválido');
  }

  private async ensureUserExists(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { idUsuario: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  private async ensureCategoryExists(categoryId?: number): Promise<void> {
    if (!categoryId) return;

    const category = await this.categoryRepository.findOne({
      where: { idCategoria: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }

  private async ensureParentCommentConsistency(
    parentId: number | undefined,
    target: { idHilo?: number; idArticulo?: number },
  ): Promise<void> {
    if (!parentId) return;

    const parent = await this.commentRepository.findOne({
      where: { idComentario: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Comentario padre no encontrado');
    }

    const sameThread = !!target.idHilo && parent.idHilo === target.idHilo;
    const sameArticle =
      !!target.idArticulo && parent.idArticulo === target.idArticulo;

    if (!sameThread && !sameArticle) {
      throw new BadRequestException(
        'El comentario padre no pertenece al mismo destino',
      );
    }
  }

  private async getScoresByField(
    field: 'idHilo' | 'idComentario' | 'idArticulo',
    ids: number[],
  ): Promise<Map<number, number>> {
    if (ids.length === 0) {
      return new Map();
    }

    const votes = await this.voteRepository.find({
      where: { [field]: In(ids) } as Record<string, unknown>,
    });

    const scores = new Map<number, number>();
    for (const vote of votes) {
      const key = vote[field];
      if (!key) continue;
      const current = scores.get(key) ?? 0;
      const next =
        vote.tipo === TipoValoracion.UPVOTE ? current + 1 : current - 1;
      scores.set(key, next);
    }

    return scores;
  }

  private hasArticleAuthorRole(roles: string[]): boolean {
    const normalized = roles.map((role) => role.toUpperCase());
    return (
      normalized.includes('AUXILIAR') ||
      normalized.includes('ADMIN') ||
      normalized.includes('ADMINISTRADOR')
    );
  }

  private ensureModeratorRole(roles: string[]): void {
    const normalized = roles.map((role) => role.toUpperCase());
    if (
      !normalized.includes('ADMIN') &&
      !normalized.includes('ADMINISTRADOR') &&
      !normalized.includes('MODERADOR')
    ) {
      throw new ForbiddenException(
        'Solo MODERADOR o ADMIN pueden moderar reportes',
      );
    }
  }
}
