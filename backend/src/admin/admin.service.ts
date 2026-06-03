import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus, UserRole } from '../types';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingArticles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PENDING },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true, avatar: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.article.count({ where: { status: ArticleStatus.PENDING } }),
    ]);
    return { data: articles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approveArticle(articleId: number) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');
    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date(), rejectReason: null },
    });
  }

  async rejectArticle(articleId: number, reason: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');
    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.REJECTED, rejectReason: reason },
    });
  }

  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, email: true, avatar: true, role: true, bio: true, createdAt: true,
          _count: { select: { articles: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(userId: number, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });
  }

  async getStats() {
    const [totalUsers, totalArticles, totalPublished, totalPending, totalComments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.article.count(),
      this.prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      this.prisma.article.count({ where: { status: ArticleStatus.PENDING } }),
      this.prisma.comment.count(),
    ]);
    return { totalUsers, totalArticles, totalPublished, totalPending, totalComments };
  }
}
