'use client';

import { useEffect, useState, useCallback } from 'react';
import { articlesApi, categoriesApi, tagsApi } from '@/lib/api';
import { Article, Category, Tag } from '@/types';
import { ArticleCard } from '@/components/ArticleCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await articlesApi.getAll({
        page: 1,
        limit: 12,
        category: selectedCategory || undefined,
        tag: selectedTag || undefined,
        search: search || undefined,
      });
      setArticles(response.data);
      setPagination({ page: response.pagination.page, totalPages: response.pagination.totalPages });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedTag, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadArticles();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadArticles]);

  useEffect(() => {
    const loadFilters = async () => {
      const [cats, tgs] = await Promise.all([categoriesApi.getAll(), tagsApi.getAll()]);
      setCategories(cats);
      setTags(tgs);
    };
    loadFilters();
  }, []);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearch('');
  };

  const hasFilters = selectedCategory || selectedTag || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">技术文章</h1>
        <p className="text-gray-600">探索最新的技术分享和教程</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="relative mb-4">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文章标题、内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">分类筛选</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <FiX className="w-3 h-3" />
                清除筛选
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                {cat._count && (
                  <span className="ml-1 text-xs opacity-80">({cat._count.articles})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-700 mb-2">标签</div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 15).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(selectedTag === tag.slug ? null : tag.slug)}
                  className={`px-2.5 py-1 rounded-full text-xs transition ${
                    selectedTag === tag.slug
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-80 animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-2">📭</div>
          <p className="text-gray-500">暂无符合条件的文章</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  );
}
