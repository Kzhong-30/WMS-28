import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async findByArticle(articleId: number) {
    return this.prisma.like.findMany({
      where: { articleId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
  }
}
