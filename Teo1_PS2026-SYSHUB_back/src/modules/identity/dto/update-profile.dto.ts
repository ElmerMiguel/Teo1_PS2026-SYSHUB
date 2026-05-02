import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  apellido?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  fotoPerfil?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  carnet?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  semestre?: number;
}
