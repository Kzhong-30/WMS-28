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
