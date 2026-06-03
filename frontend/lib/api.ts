import axios from 'axios';
import {
  User,
  Article,
  Category,
  Tag,
  Comment,
  PaginatedResponse,
  ArticleFilters,
  ArticleStatus,
  UserRole,
} from '@/types';

const API_BASE = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/users').then((r) => r.data),
  getOne: (id: number) => api.get<User>(`/users/${id}`).then((r) => r.data),
  updateProfile: (data: { bio?: string; avatar?: string }) =>
    api.put<User>('/users/profile', data).then((r) => r.data),
};

export const articlesApi = {
  getAll: (filters?: ArticleFilters) =>
    api.get<PaginatedResponse<Article>>('/articles', { params: filters }).then((r) => r.data),
  getMyArticles: (filters?: ArticleFilters) =>
    api.get<PaginatedResponse<Article>>('/articles/my', { params: filters }).then((r) => r.data),
  getBySlug: (slug: string) => api.get<Article>(`/articles/${slug}`).then((r) => r.data),
  getRelated: (slug: string) => api.get<Article[]>(`/articles/${slug}/related`).then((r) => r.data),
  getInteractions: (slug: string) =>
    api.get<{ liked: boolean; favorited: boolean }>(`/articles/${slug}/interactions`).then((r) => r.data),
  create: (data: {
    title: string;
    summary?: string;
    content: string;
    coverImage?: string;
    status?: ArticleStatus;
    categoryId?: number;
    tagIds?: number[];
  }) => api.post<Article>('/articles', data).then((r) => r.data),
  update: (id: number, data: Partial<{
    title: string;
    summary: string;
    content: string;
    coverImage: string;
    status: ArticleStatus;
    categoryId: number;
    tagIds: number[];
  }>) => api.put<Article>(`/articles/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/articles/${id}`).then((r) => r.data),
  toggleLike: (id: number) => api.post<{ liked: boolean }>(`/articles/${id}/like`).then((r) => r.data),
  toggleFavorite: (id: number) => api.post<{ favorited: boolean }>(`/articles/${id}/favorite`).then((r) => r.data),
};

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: number, data: { name?: string; description?: string }) =>
    api.put<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const tagsApi = {
  getAll: () => api.get<Tag[]>('/tags').then((r) => r.data),
  create: (data: { name: string }) => api.post<Tag>('/tags', data).then((r) => r.data),
  update: (id: number, data: { name?: string }) => api.put<Tag>(`/tags/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/tags/${id}`).then((r) => r.data),
};

export const commentsApi = {
  create: (data: { articleId: number; content: string }) =>
    api.post<Comment>('/comments', data).then((r) => r.data),
  delete: (id: number) => api.delete(`/comments/${id}`).then((r) => r.data),
};

export const adminApi = {
  getStats: () =>
    api.get<{ totalUsers: number; totalArticles: number; totalPublished: number; totalPending: number; totalComments: number }>('/admin/stats').then((r) => r.data),
  getPendingArticles: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Article>>('/admin/articles/pending', { params: { page, limit } }).then((r) => r.data),
  approveArticle: (id: number) => api.post(`/admin/articles/${id}/approve`).then((r) => r.data),
  rejectArticle: (id: number, reason: string) =>
    api.post(`/admin/articles/${id}/reject`, { reason }).then((r) => r.data),
  getAllUsers: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<User & { _count: { articles: number } }>>('/admin/users', { params: { page, limit } }).then((r) => r.data),
  updateUserRole: (id: number, role: UserRole) =>
    api.put<User>(`/admin/users/${id}/role`, { role }).then((r) => r.data),
};

export const uploadApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string; filename: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

export default api;
