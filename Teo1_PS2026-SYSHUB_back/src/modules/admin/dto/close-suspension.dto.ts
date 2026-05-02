import { IsOptional, IsString, Length } from 'class-validator';

export class CloseSuspensionDto {
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notaCierre?: string;
}
