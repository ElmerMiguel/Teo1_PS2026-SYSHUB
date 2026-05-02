import { IsEnum, IsInt, Min } from 'class-validator';
import { TipoContenidoGuardado } from '../entities/material-guardado.entity';

export class SaveMaterialDto {
  @IsEnum(TipoContenidoGuardado)
  tipoContenido!: TipoContenidoGuardado;

  @IsInt()
  @Min(1)
  idContenido!: number;
}
