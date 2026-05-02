import { IsOptional, IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(3, 50)
  nombreRol!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  descripcion?: string;
}
