import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @Length(5, 150)
  email!: string;

  @IsString()
  @Length(8, 255)
  password!: string;
}
