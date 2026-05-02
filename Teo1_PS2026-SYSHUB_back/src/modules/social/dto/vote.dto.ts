import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  Validate,
  type ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TipoValoracion } from '../entities/valoracion.entity';

@ValidatorConstraint({ name: 'oneVoteTarget', async: false })
class OneVoteTargetConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args?: ValidationArguments): boolean {
    if (!args) return false;
    const dto = args.object as VoteDto;
    const targets = [dto.idHilo, dto.idComentario, dto.idArticulo].filter(
      (value) => value !== undefined,
    );
    return targets.length === 1;
  }

  defaultMessage() {
    return 'Debes indicar exactamente un destino de valoración (hilo, comentario o artículo).';
  }
}

export class VoteDto {
  @IsEnum(TipoValoracion)
  tipo!: TipoValoracion;

  @IsOptional()
  @IsInt()
  @Min(1)
  idHilo?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  idComentario?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  idArticulo?: number;

  @Validate(OneVoteTargetConstraint)
  _targetValidation?: boolean;
}
