import { IsEmail, Length } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  @Length(5, 150)
  email!: string;
}
