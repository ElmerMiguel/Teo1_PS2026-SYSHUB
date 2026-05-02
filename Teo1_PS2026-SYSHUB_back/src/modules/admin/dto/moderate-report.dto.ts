import { IsEnum } from 'class-validator';
import { EstadoReporte } from '../../social/entities/reporte.entity';

export enum EstadoModeracionAdmin {
  RESUELTO = EstadoReporte.RESUELTO,
  DESESTIMADO = EstadoReporte.DESESTIMADO,
}

export class ModerateReportDto {
  @IsEnum(EstadoModeracionAdmin)
  estado!: EstadoModeracionAdmin;
}
