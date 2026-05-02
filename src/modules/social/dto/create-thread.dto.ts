import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @Length(5, 255)
  titulo!: string;

  @IsString()
  @Length(10, 20000)
  contenido!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  idCategoria?: number;
}
