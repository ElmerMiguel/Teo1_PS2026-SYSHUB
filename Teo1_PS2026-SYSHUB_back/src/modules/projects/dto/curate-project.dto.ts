import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CurateProjectDto {
  @IsOptional()
  @IsString()
  comentarioAuxiliar?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
