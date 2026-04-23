import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class AddProjectFileDto {
  @IsString()
  @Length(1, 255)
  nombreArchivo!: string;

  @IsString()
  @Length(1, 500)
  rutaArchivo!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  tipoMime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tamanioBytes?: number;
}
