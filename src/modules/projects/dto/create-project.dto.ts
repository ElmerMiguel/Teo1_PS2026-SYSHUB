import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { EstadoProyecto } from '../entities/proyecto.entity';

export class CreateProjectDto {
  @IsString()
  @Length(3, 200)
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  stackTecnologico?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(EstadoProyecto)
  estado?: EstadoProyecto;

  @IsOptional()
  @IsInt()
  @Min(1)
  idCategoria?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  etiquetas?: string[];
}
