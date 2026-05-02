import { IsInt, Min } from 'class-validator';

export class RemoveSavedDto {
  @IsInt()
  @Min(1)
  idGuardado!: number;
}
