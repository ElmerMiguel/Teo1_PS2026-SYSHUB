import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsString()
  @Length(2, 100)
  apellido!: string;

  @IsEmail()
  @Length(5, 150)
  email!: string;

  @IsString()
  @Length(8, 255)
  password!: string;

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
