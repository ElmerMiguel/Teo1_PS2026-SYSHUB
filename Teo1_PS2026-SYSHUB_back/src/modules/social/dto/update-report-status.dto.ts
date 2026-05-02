import { IsEnum } from 'class-validator';
import { EstadoReporte } from '../entities/reporte.entity';

export enum EstadoReporteModeracion {
  RESUELTO = EstadoReporte.RESUELTO,
  DESESTIMADO = EstadoReporte.DESESTIMADO,
}

export class UpdateReportStatusDto {
  @IsEnum(EstadoReporteModeracion)
  estado!: EstadoReporteModeracion;
}
