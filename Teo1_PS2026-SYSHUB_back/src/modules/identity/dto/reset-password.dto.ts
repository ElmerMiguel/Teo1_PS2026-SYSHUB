import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Length(20, 255)
  token!: string;

  @IsString()
  @Length(8, 255)
  newPassword!: string;
}
