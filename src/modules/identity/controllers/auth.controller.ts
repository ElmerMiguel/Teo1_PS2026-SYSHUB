import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SaveMaterialDto } from '../dto/save-material.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('password/reset/request')
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() payload: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, payload);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  listSaved(@CurrentUser() user: JwtPayload) {
    return this.authService.listSavedMaterial(user.sub);
  }

  @Post('saved')
  @UseGuards(JwtAuthGuard)
  saveMaterial(@CurrentUser() user: JwtPayload, @Body() dto: SaveMaterialDto) {
    return this.authService.saveMaterial(user.sub, dto);
  }

  @Delete('saved/:idGuardado')
  @UseGuards(JwtAuthGuard)
  removeSaved(
    @CurrentUser() user: JwtPayload,
    @Param('idGuardado', ParseIntPipe) idGuardado: number,
  ) {
    return this.authService.removeSavedMaterial(user.sub, idGuardado);
  }
}
