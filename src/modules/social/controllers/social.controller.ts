import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/current-user.decorator';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { JwtPayload } from '../../identity/auth/jwt-payload.interface';
import { CreateArticleDto } from '../dto/create-article.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReportDto } from '../dto/create-report.dto';
import { CreateThreadDto } from '../dto/create-thread.dto';
import { ListReportsDto } from '../dto/list-reports.dto';
import { ListSocialDto } from '../dto/list-social.dto';
import {
  ArticleResponseDto,
  CommentResponseDto,
  PaginatedSocialResponseDto,
  ReportResponseDto,
  ThreadResponseDto,
  VoteResponseDto,
} from '../dto/social-response.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { VoteDto } from '../dto/vote.dto';
import { SocialSerializer } from '../serializers/social.serializer';
import { SocialService } from '../services/social.service';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  async createThread(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateThreadDto,
  ): Promise<ThreadResponseDto> {
    const thread = await this.socialService.createThread(user, dto);
    return SocialSerializer.toThreadDto(thread);
  }

  @Get('threads')
  async listThreads(
    @Query() query: ListSocialDto,
  ): Promise<PaginatedSocialResponseDto<ThreadResponseDto>> {
    const result = await this.socialService.listThreads(query);
    return SocialSerializer.toPaginatedDto(
      result.items.map((thread) => SocialSerializer.toThreadDto(thread)),
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get('threads/:idHilo')
  async getThread(
    @Param('idHilo', ParseIntPipe) idHilo: number,
  ): Promise<ThreadResponseDto> {
    const thread = await this.socialService.getThreadById(idHilo);
    return SocialSerializer.toThreadDto(thread);
  }

  @Post('articles')
  @UseGuards(JwtAuthGuard)
  createArticle(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.socialService
      .createArticle(user, dto)
      .then((article) => SocialSerializer.toArticleDto(article));
  }

  @Get('articles')
  async listArticles(
    @Query() query: ListSocialDto,
  ): Promise<PaginatedSocialResponseDto<ArticleResponseDto>> {
    const result = await this.socialService.listArticles(query);
    return SocialSerializer.toPaginatedDto(
      result.items.map((article) => SocialSerializer.toArticleDto(article)),
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get('articles/:idArticulo')
  async getArticle(
    @Param('idArticulo', ParseIntPipe) idArticulo: number,
  ): Promise<ArticleResponseDto> {
    const article = await this.socialService.getArticleById(idArticulo);
    return SocialSerializer.toArticleDto(article);
  }

  @Post('threads/:idHilo/comments')
  @UseGuards(JwtAuthGuard)
  createThreadComment(
    @CurrentUser() user: JwtPayload,
    @Param('idHilo', ParseIntPipe) idHilo: number,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.socialService
      .createThreadComment(user, idHilo, dto)
      .then((comment) => SocialSerializer.toCommentDto(comment));
  }

  @Get('threads/:idHilo/comments')
  async listThreadComments(
    @Param('idHilo', ParseIntPipe) idHilo: number,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.socialService.listThreadComments(idHilo);
    return comments.map((comment) => SocialSerializer.toCommentDto(comment));
  }

  @Get('threads/:idHilo/comments/ranked')
  async listThreadCommentsRanked(
    @Param('idHilo', ParseIntPipe) idHilo: number,
  ): Promise<CommentResponseDto[]> {
    const rows = await this.socialService.listThreadCommentsRanked(idHilo);
    return rows.map((row) =>
      SocialSerializer.toCommentDto(row.comment, row.score),
    );
  }

  @Post('articles/:idArticulo/comments')
  @UseGuards(JwtAuthGuard)
  createArticleComment(
    @CurrentUser() user: JwtPayload,
    @Param('idArticulo', ParseIntPipe) idArticulo: number,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.socialService
      .createArticleComment(user, idArticulo, dto)
      .then((comment) => SocialSerializer.toCommentDto(comment));
  }

  @Get('articles/:idArticulo/comments')
  async listArticleComments(
    @Param('idArticulo', ParseIntPipe) idArticulo: number,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.socialService.listArticleComments(idArticulo);
    return comments.map((comment) => SocialSerializer.toCommentDto(comment));
  }

  @Post('votes')
  @UseGuards(JwtAuthGuard)
  async vote(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VoteDto,
  ): Promise<VoteResponseDto> {
    const result = await this.socialService.vote(user, dto);
    return SocialSerializer.toVoteDto(
      result.idValoracion,
      result.tipo,
      result.score,
    );
  }

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  async createReport(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReportDto,
  ): Promise<ReportResponseDto> {
    const report = await this.socialService.createReport(user, dto);
    return SocialSerializer.toReportDto(report);
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard)
  async listReports(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListReportsDto,
  ): Promise<PaginatedSocialResponseDto<ReportResponseDto>> {
    const result = await this.socialService.listReports(user, query);
    return SocialSerializer.toPaginatedDto(
      result.items.map((report) => SocialSerializer.toReportDto(report)),
      result.total,
      result.page,
      result.limit,
    );
  }

  @Patch('reports/:idReporte/status')
  @UseGuards(JwtAuthGuard)
  async updateReportStatus(
    @CurrentUser() user: JwtPayload,
    @Param('idReporte', ParseIntPipe) idReporte: number,
    @Body() dto: UpdateReportStatusDto,
  ): Promise<ReportResponseDto> {
    const report = await this.socialService.updateReportStatus(
      user,
      idReporte,
      dto,
    );
    return SocialSerializer.toReportDto(report);
  }
}
