import { CategoriaEntity } from '../../projects/entities/categoria.entity';
import {
  ArticleResponseDto,
  CommentResponseDto,
  PaginatedSocialResponseDto,
  ReportResponseDto,
  SocialCategoryResponseDto,
  ThreadResponseDto,
  UserSummaryDto,
  VoteResponseDto,
} from '../dto/social-response.dto';
import { ArticuloEntity } from '../entities/articulo.entity';
import { ComentarioEntity } from '../entities/comentario.entity';
import { HiloForoEntity } from '../entities/hilo-foro.entity';
import { ReporteEntity } from '../entities/reporte.entity';

export class SocialSerializer {
  static toUserSummaryDto(user?: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    fotoPerfil?: string | null;
  }): UserSummaryDto | undefined {
    if (!user) return undefined;
    return {
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      fotoPerfil: user.fotoPerfil ?? undefined,
    };
  }

  static toCategoryDto(category: CategoriaEntity): SocialCategoryResponseDto {
    return {
      idCategoria: category.idCategoria,
      nombre: category.nombre,
      areaTecnica: category.areaTecnica,
    };
  }

  static toThreadDto(
    thread: HiloForoEntity,
    score?: number,
  ): ThreadResponseDto {
    return {
      idHilo: thread.idHilo,
      titulo: thread.titulo,
      contenido: thread.contenido,
      fechaCreacion: thread.fechaCreacion,
      idUsuario: thread.idUsuario,
      idCategoria: thread.idCategoria,
      estado: thread.estado,
      vistas: thread.vistas,
      fijado: thread.fijado,
      categoria: thread.categoria
        ? SocialSerializer.toCategoryDto(thread.categoria)
        : undefined,
      usuario: SocialSerializer.toUserSummaryDto(thread.usuario),
      score,
    };
  }

  static toArticleDto(
    article: ArticuloEntity,
    score?: number,
  ): ArticleResponseDto {
    return {
      idArticulo: article.idArticulo,
      titulo: article.titulo,
      contenidoHtml: article.contenidoHtml,
      resumen: article.resumen,
      fechaPublicacion: article.fechaPublicacion,
      idAutor: article.idAutor,
      estado: article.estado,
      imagenPortada: article.imagenPortada,
      autor: SocialSerializer.toUserSummaryDto(article.autor),
      score,
    };
  }

  static toCommentDto(
    comment: ComentarioEntity,
    score?: number,
  ): CommentResponseDto {
    return {
      idComentario: comment.idComentario,
      contenido: comment.contenido,
      fechaCreacion: comment.fechaCreacion,
      idUsuario: comment.idUsuario,
      idHilo: comment.idHilo,
      idArticulo: comment.idArticulo,
      idComentarioPadre: comment.idComentarioPadre,
      eliminado: comment.eliminado,
      score,
      usuario: SocialSerializer.toUserSummaryDto(comment.usuario),
    };
  }

  static toReportDto(report: ReporteEntity): ReportResponseDto {
    return {
      idReporte: report.idReporte,
      razon: report.razon,
      descripcion: report.descripcion,
      fechaReporte: report.fechaReporte,
      estado: report.estado,
      idReportador: report.idReportador,
      idModerador: report.idModerador,
      idHilo: report.idHilo,
      idComentario: report.idComentario,
      idProyecto: report.idProyecto,
    };
  }

  static toPaginatedDto<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedSocialResponseDto<T> {
    return { items, total, page, limit };
  }

  static toVoteDto(
    idValoracion: number,
    tipo: string,
    score: number,
  ): VoteResponseDto {
    return {
      idValoracion,
      tipo: tipo as VoteResponseDto['tipo'],
      score,
    };
  }
}
