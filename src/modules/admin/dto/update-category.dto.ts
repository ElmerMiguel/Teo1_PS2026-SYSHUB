import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { AreaTecnicaCategoria } from '../../projects/entities/categoria.entity';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  descripcion?: string;

  @IsOptional()
  @IsEnum(AreaTecnicaCategoria)
  areaTecnica?: AreaTecnicaCategoria;

  @IsOptional()
  @IsInt()
  @Min(1)
  idCategoriaPadre?: number;
}
