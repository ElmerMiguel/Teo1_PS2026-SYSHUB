import { IsString, Length } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @Length(3, 50)
  nombreRol!: string;
}
