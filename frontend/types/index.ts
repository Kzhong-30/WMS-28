export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ArticleStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
} as const;
export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  _count?: { articles: number };
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { articles: number };
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status: ArticleStatus;
  views: number;
  likeCount: number;
  commentCount: number;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  authorId: number;
  author: { id: number; username: string; avatar: string; bio?: string; createdAt?: string };
  category?: Category;
  categoryId?: number;
  tags: Tag[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  articleId: number;
  authorId: number;
  author: { id: number; username: string; avatar: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  status?: ArticleStatus;
}
