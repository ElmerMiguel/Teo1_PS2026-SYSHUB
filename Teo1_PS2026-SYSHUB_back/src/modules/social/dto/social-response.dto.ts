import { AreaTecnicaCategoria } from '../../projects/entities/categoria.entity';
import { EstadoArticulo } from '../entities/articulo.entity';
import { EstadoHilo } from '../entities/hilo-foro.entity';
import { EstadoReporte } from '../entities/reporte.entity';
import { TipoValoracion } from '../entities/valoracion.entity';

export class SocialCategoryResponseDto {
  idCategoria!: number;
  nombre!: string;
  areaTecnica!: AreaTecnicaCategoria;
}

export class UserSummaryDto {
  idUsuario!: number;
  nombre!: string;
  apellido!: string;
  fotoPerfil?: string;
}

export class ThreadResponseDto {
  idHilo!: number;
  titulo!: string;
  contenido!: string;
  fechaCreacion!: Date;
  idUsuario!: number;
  idCategoria?: number;
  estado!: EstadoHilo;
  vistas!: number;
  fijado!: boolean;
  categoria?: SocialCategoryResponseDto;
  usuario?: UserSummaryDto;
  score?: number;
}

export class ArticleResponseDto {
  idArticulo!: number;
  titulo!: string;
  contenidoHtml!: string;
  resumen?: string;
  fechaPublicacion!: Date;
  idAutor!: number;
  estado!: EstadoArticulo;
  imagenPortada?: string;
  autor?: UserSummaryDto;
  score?: number;
}

export class CommentResponseDto {
  idComentario!: number;
  contenido!: string;
  fechaCreacion!: Date;
  idUsuario!: number;
  idHilo?: number;
  idArticulo?: number;
  idComentarioPadre?: number;
  eliminado!: boolean;
  score?: number;
  usuario?: UserSummaryDto;
}

export class VoteResponseDto {
  idValoracion!: number;
  tipo!: TipoValoracion;
  score!: number;
}

export class ReportResponseDto {
  idReporte!: number;
  razon!: string;
  descripcion?: string;
  fechaReporte!: Date;
  estado!: EstadoReporte;
  idReportador!: number;
  idModerador?: number;
  idHilo?: number;
  idComentario?: number;
  idProyecto?: number;
}

export class PaginatedSocialResponseDto<T> {
  items!: T[];
  total!: number;
  page!: number;
  limit!: number;
}
