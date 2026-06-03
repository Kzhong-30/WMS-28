import { Controller, Get, Query, Param, Post, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticleStatus } from '../types';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  async findAll(@Query() query: {
    page?: string;
    limit?: string;
    category?: string;
    tag?: string;
    search?: string;
    status?: ArticleStatus;
  }) {
    return this.articlesService.findAll({
      ...query,
      page: query.page ? +query.page : 1,
      limit: query.limit ? +query.limit : 10,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyArticles(@Request() req, @Query() query: { page?: string; limit?: string; status?: ArticleStatus }) {
    return this.articlesService.findAll({
      ...query,
      page: query.page ? +query.page : 1,
      limit: query.limit ? +query.limit : 10,
      authorId: req.user.userId,
      status: query.status,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.articlesService.findOne(slug);
  }

  @Get(':slug/related')
  async getRelated(@Param('slug') slug: string) {
    return this.articlesService.getRelated(slug);
  }

  @Get(':slug/interactions')
  @UseGuards(JwtAuthGuard)
  async checkInteractions(@Param('slug') slug: string, @Request() req) {
    const article = await this.articlesService.findOne(slug, false);
    return this.articlesService.checkUserInteractions(req.user.userId, article.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(req.user.userId, createArticleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(req.user.userId, +id, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string) {
    return this.articlesService.delete(req.user.userId, req.user.role, +id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Request() req, @Param('id') id: string) {
    return this.articlesService.toggleLike(req.user.userId, +id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.articlesService.toggleFavorite(req.user.userId, +id);
  }
}
