import { CategoriaEntity } from '../../projects/entities/categoria.entity';
import {
  ArticleResponseDto,
  CommentResponseDto,
  PaginatedSocialResponseDto,
  ReportResponseDto,
  SocialCategoryResponseDto,
  ThreadResponseDto,
  VoteResponseDto,
} from '../dto/social-response.dto';
import { ArticuloEntity } from '../entities/articulo.entity';
import { ComentarioEntity } from '../entities/comentario.entity';
import { HiloForoEntity } from '../entities/hilo-foro.entity';
import { ReporteEntity } from '../entities/reporte.entity';

export class SocialSerializer {
  static toCategoryDto(category: CategoriaEntity): SocialCategoryResponseDto {
    return {
      idCategoria: category.idCategoria,
      nombre: category.nombre,
      areaTecnica: category.areaTecnica,
    };
  }

  static toThreadDto(thread: HiloForoEntity): ThreadResponseDto {
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
    };
  }

  static toArticleDto(article: ArticuloEntity): ArticleResponseDto {
    return {
      idArticulo: article.idArticulo,
      titulo: article.titulo,
      contenidoHtml: article.contenidoHtml,
      resumen: article.resumen,
      fechaPublicacion: article.fechaPublicacion,
      idAutor: article.idAutor,
      estado: article.estado,
      imagenPortada: article.imagenPortada,
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
