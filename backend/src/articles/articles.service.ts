import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus, UserRole } from '../types';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import * as slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    status?: ArticleStatus;
    authorId?: number;
  }) {
    const { page = 1, limit = 10, category, tag, search, status = ArticleStatus.PUBLISHED, authorId } = query;
    const skip = (page - 1) * limit;

    const where: any = { status };
    if (category) where.category = { slug: category };
    if (tag) where.tags = { some: { slug: tag } };
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles.map((a) => ({
        ...a,
        likeCount: a._count.likes,
        commentCount: a._count.comments,
        _count: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(slug: string, incrementViews = true) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, username: true, avatar: true, bio: true, createdAt: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        comments: {
          include: { author: { select: { id: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!article) throw new NotFoundException('Article not found');

    if (incrementViews) {
      await this.prisma.article.update({ where: { slug }, data: { views: { increment: 1 } } });
    }

    return {
      ...article,
      likeCount: article._count.likes,
      commentCount: article._count.comments,
      _count: undefined,
    };
  }

  async create(userId: number, createArticleDto: CreateArticleDto) {
    const slugBase = slugify(createArticleDto.title, { lower: true, strict: true });
    let slug = slugBase;
    let count = 1;
    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${count++}`;
    }

    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        slug,
        summary: createArticleDto.summary,
        content: createArticleDto.content,
        coverImage: createArticleDto.coverImage,
        status: createArticleDto.status || ArticleStatus.DRAFT,
        authorId: userId,
        categoryId: createArticleDto.categoryId,
        publishedAt: createArticleDto.status === ArticleStatus.PUBLISHED ? new Date() : null,
        tags: createArticleDto.tagIds ? { connect: createArticleDto.tagIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        category: true,
        tags: true,
      },
    });

    return article;
  }

  async update(userId: number, id: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    if (article.authorId !== userId) throw new ForbiddenException('You can only edit your own articles');

    let data: any = { ...updateArticleDto };
    if (updateArticleDto.title) {
      const slugBase = slugify(updateArticleDto.title, { lower: true, strict: true });
      let slug = slugBase;
      let count = 1;
      while (await this.prisma.article.findUnique({ where: { slug } })) {
        if ((await this.prisma.article.findUnique({ where: { slug } }))?.id === id) break;
        slug = `${slugBase}-${count++}`;
      }
      data.slug = slug;
    }
    if (updateArticleDto.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      data.publishedAt = new Date();
    }
    if (updateArticleDto.tagIds) {
      data.tags = { set: updateArticleDto.tagIds.map((id) => ({ id })) };
      delete data.tagIds;
    }

    return this.prisma.article.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        category: true,
        tags: true,
      },
    });
  }

  async delete(userId: number, userRole: UserRole, id: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    if (article.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own articles');
    }
    await this.prisma.article.delete({ where: { id } });
    return { message: 'Article deleted successfully' };
  }

  async getRelated(slug: string, limit = 4) {
    const article = await this.prisma.article.findUnique({ where: { slug }, include: { tags: true } });
    if (!article) return [];

    const tagIds = article.tags.map((t) => t.id);
    const related = await this.prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        OR: tagIds.length > 0 ? [{ tags: { some: { id: { in: tagIds } } } }, { categoryId: article.categoryId }] : [{ categoryId: article.categoryId }],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return related;
  }

  async toggleLike(userId: number, articleId: number) {
    const existing = await this.prisma.like.findUnique({ where: { articleId_userId: { articleId, userId } } });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      await this.prisma.article.update({ where: { id: articleId }, data: { likeCount: { decrement: 1 } } });
      return { liked: false };
    } else {
      await this.prisma.like.create({ data: { articleId, userId } });
      await this.prisma.article.update({ where: { id: articleId }, data: { likeCount: { increment: 1 } } });
      return { liked: true };
    }
  }

  async toggleFavorite(userId: number, articleId: number) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { favorites: { where: { id: articleId } } },
    });

    const isFavorited = user.favorites.length > 0;
    if (isFavorited) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { favorites: { disconnect: { id: articleId } } },
      });
      return { favorited: false };
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { favorites: { connect: { id: articleId } } },
      });
      return { favorited: true };
    }
  }

  async checkUserInteractions(userId: number, articleId: number) {
    const [like, user] = await Promise.all([
      this.prisma.like.findUnique({ where: { articleId_userId: { articleId, userId } } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { favorites: { where: { id: articleId } } },
      }),
    ]);
    return {
      liked: !!like,
      favorited: user?.favorites.length > 0,
    };
  }
}
