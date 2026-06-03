'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { fromNow, formatNumber } from '@/lib/utils';
import { FiEye, FiHeart, FiMessageSquare } from 'react-icons/fi';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link href={`/article/${article.slug}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
        {article.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {article.category && (
              <span className="inline-block bg-primary-50 text-primary-600 text-xs font-medium px-2.5 py-1 rounded-full">
                {article.category.name}
              </span>
            )}
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.summary}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={article.author.avatar}
                alt={article.author.username}
                className="w-7 h-7 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{article.author.username}</p>
                <p className="text-xs text-gray-500">{fromNow(article.publishedAt || article.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <FiEye className="w-3.5 h-3.5" />
                {formatNumber(article.views)}
              </span>
              <span className="flex items-center gap-1">
                <FiHeart className="w-3.5 h-3.5" />
                {formatNumber(article.likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <FiMessageSquare className="w-3.5 h-3.5" />
                {formatNumber(article.commentCount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
