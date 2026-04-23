import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(1, 4000)
  contenido!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  idComentarioPadre?: number;
}
