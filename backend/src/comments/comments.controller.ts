import { Controller, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() data: { articleId: number; content: string }) {
    return this.commentsService.create(req.user.userId, data.articleId, data.content);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string) {
    return this.commentsService.delete(req.user.userId, req.user.role, +id);
  }
}
