import { Controller, Get, Param } from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Get('article/:articleId')
  async findByArticle(@Param('articleId') articleId: string) {
    return this.likesService.findByArticle(+articleId);
  }
}
