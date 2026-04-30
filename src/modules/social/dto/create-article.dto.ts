import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { EstadoArticulo } from '../entities/articulo.entity';

export class CreateArticleDto {
  @IsString()
  @Length(5, 255)
  titulo!: string;

  @IsString()
  @Length(5, 50000)
  contenidoHtml!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  resumen?: string;

  @IsOptional()
  @IsString()
  @Length(5, 500)
  imagenPortada?: string;

  @IsOptional()
  @IsEnum(EstadoArticulo)
  estado?: EstadoArticulo;
}
