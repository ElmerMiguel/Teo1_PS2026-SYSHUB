import { IsOptional, IsString, Length } from 'class-validator';

export class CreateSuspensionDto {
  @IsString()
  @Length(5, 255)
  razon!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  detalle?: string;
}
