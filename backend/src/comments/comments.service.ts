import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, articleId: number, content: string) {
    return this.prisma.comment.create({
      data: { content, articleId, authorId: userId },
      include: { author: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async delete(userId: number, userRole: string, id: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('You can only delete your own comments');
    }
    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted successfully' };
  }

  async findByArticle(articleId: number) {
    return this.prisma.comment.findMany({
      where: { articleId },
      include: { author: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
