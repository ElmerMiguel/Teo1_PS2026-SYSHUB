import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { EstadoProyecto } from '../entities/proyecto.entity';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @Length(3, 200)
  titulo?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  descripcion?: string;

  @IsOptional()
  @IsObject()
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
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  etiquetas?: string[];
}
