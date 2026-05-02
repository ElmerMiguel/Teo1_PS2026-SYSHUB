import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/current-user.decorator';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { AdminService } from '../services/admin.service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { CloseSuspensionDto } from '../dto/close-suspension.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { CreateSuspensionDto } from '../dto/create-suspension.dto';
import { ListAuditDto } from '../dto/list-audit.dto';
import { ListAdminReportsDto } from '../dto/list-admin-reports.dto';
import { ListUsersDto } from '../dto/list-users.dto';
import { ModerateReportDto } from '../dto/moderate-report.dto';
import { SetUserActiveDto } from '../dto/set-user-active.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers(@CurrentUser() user: JwtPayload, @Query() query: ListUsersDto) {
    return this.adminService.listUsers(user, query);
  }

  @Get('users/:idUsuario/suspensions')
  listSuspensions(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ) {
    return this.adminService.listSuspensions(user, idUsuario);
  }

  @Post('users/:idUsuario/suspensions')
  createSuspension(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Body() dto: CreateSuspensionDto,
  ) {
    return this.adminService.createSuspension(user, idUsuario, dto);
  }

  @Patch('users/:idUsuario/suspensions/:idSuspension/close')
  closeSuspension(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idSuspension', ParseIntPipe) idSuspension: number,
    @Body() dto: CloseSuspensionDto,
  ) {
    return this.adminService.closeSuspension(
      user,
      idUsuario,
      idSuspension,
      dto,
    );
  }

  @Patch('users/:idUsuario/active')
  setUserActive(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Body() dto: SetUserActiveDto,
  ) {
    return this.adminService.setUserActive(user, idUsuario, dto);
  }

  @Post('users/:idUsuario/roles')
  assignRole(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Body() dto: AssignRoleDto,
  ) {
    return this.adminService.assignRole(user, idUsuario, dto);
  }

  @Delete('users/:idUsuario/roles/:nombreRol')
  removeRole(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('nombreRol') nombreRol: string,
  ) {
    return this.adminService.removeRole(user, idUsuario, nombreRol);
  }

  @Delete('users/:idUsuario')
  async deleteUser(
    @CurrentUser() user: JwtPayload,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ) {
    await this.adminService.deleteUser(user, idUsuario);
    return { message: 'Usuario eliminado correctamente' };
  }

  @Get('categories')
  listCategories(@CurrentUser() user: JwtPayload) {
    return this.adminService.listCategories(user);
  }

  @Get('categories/areas')
  listCategoryAreas(@CurrentUser() user: JwtPayload) {
    return this.adminService.listAreaTecnicas(user);
  }

  @Get('categories/tree')
  listCategoriesTree(@CurrentUser() user: JwtPayload) {
    return this.adminService.listCategoryTree(user);
  }

  @Post('categories')
  createCategory(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.adminService.createCategory(user, dto);
  }

  @Patch('categories/:idCategoria')
  updateCategory(
    @CurrentUser() user: JwtPayload,
    @Param('idCategoria', ParseIntPipe) idCategoria: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(user, idCategoria, dto);
  }

  @Delete('categories/:idCategoria')
  async deleteCategory(
    @CurrentUser() user: JwtPayload,
    @Param('idCategoria', ParseIntPipe) idCategoria: number,
  ) {
    await this.adminService.deleteCategory(user, idCategoria);
    return { message: 'Categoría eliminada correctamente' };
  }

  @Get('roles')
  listRoles(@CurrentUser() user: JwtPayload) {
    return this.adminService.listRoles(user);
  }

  @Post('roles')
  createRole(@CurrentUser() user: JwtPayload, @Body() dto: CreateRoleDto) {
    return this.adminService.createRole(user, dto);
  }

  @Patch('roles/:idRol')
  updateRole(
    @CurrentUser() user: JwtPayload,
    @Param('idRol', ParseIntPipe) idRol: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminService.updateRole(user, idRol, dto);
  }

  @Delete('roles/:idRol')
  async deleteRole(
    @CurrentUser() user: JwtPayload,
    @Param('idRol', ParseIntPipe) idRol: number,
  ) {
    await this.adminService.deleteRole(user, idRol);
    return { message: 'Rol eliminado correctamente' };
  }

  @Get('audit')
  listAudits(@CurrentUser() user: JwtPayload, @Query() query: ListAuditDto) {
    return this.adminService.listAudits(user, query);
  }

  @Get('moderation/reports')
  listReports(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListAdminReportsDto,
  ) {
    return this.adminService.listReports(user, query);
  }

  @Patch('moderation/reports/:idReporte/status')
  moderateReport(
    @CurrentUser() user: JwtPayload,
    @Param('idReporte', ParseIntPipe) idReporte: number,
    @Body() dto: ModerateReportDto,
  ) {
    return this.adminService.moderateReport(user, idReporte, dto);
  }

  @Delete('moderation/threads/:idHilo')
  async deleteThread(
    @CurrentUser() user: JwtPayload,
    @Param('idHilo', ParseIntPipe) idHilo: number,
  ) {
    await this.adminService.deleteThread(user, idHilo);
    return { message: 'Hilo eliminado correctamente' };
  }

  @Delete('moderation/comments/:idComentario')
  async deleteComment(
    @CurrentUser() user: JwtPayload,
    @Param('idComentario', ParseIntPipe) idComentario: number,
  ) {
    await this.adminService.deleteComment(user, idComentario);
    return { message: 'Comentario eliminado correctamente' };
  }

  @Delete('moderation/articles/:idArticulo')
  async deleteArticle(
    @CurrentUser() user: JwtPayload,
    @Param('idArticulo', ParseIntPipe) idArticulo: number,
  ) {
    await this.adminService.deleteArticle(user, idArticulo);
    return { message: 'Artículo eliminado correctamente' };
  }

  @Delete('moderation/projects/:idProyecto')
  async deleteProject(
    @CurrentUser() user: JwtPayload,
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
  ) {
    await this.adminService.deleteProject(user, idProyecto);
    return { message: 'Proyecto eliminado correctamente' };
  }
}
