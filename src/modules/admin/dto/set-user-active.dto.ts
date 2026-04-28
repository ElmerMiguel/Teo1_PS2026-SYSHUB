import { IsBoolean } from 'class-validator';

export class SetUserActiveDto {
  @IsBoolean()
  activo!: boolean;
}
