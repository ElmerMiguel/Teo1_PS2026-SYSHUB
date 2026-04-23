import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'oneReportTarget', async: false })
class OneReportTargetConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args?: ValidationArguments): boolean {
    if (!args) return false;
    const dto = args.object as CreateReportDto;
    const targets = [dto.idHilo, dto.idComentario, dto.idProyecto].filter(
      (value) => value !== undefined,
    );
    return targets.length === 1;
  }

  defaultMessage(): string {
    return 'Debes reportar exactamente un destino (hilo, comentario o proyecto).';
  }
}

export class CreateReportDto {
  @IsString()
  @Length(3, 255)
  razon!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  descripcion?: string;

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
  idProyecto?: number;

  @Validate(OneReportTargetConstraint)
  _targetValidation?: boolean;
}
