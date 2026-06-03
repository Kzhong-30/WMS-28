'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Article } from '@/types';
import { formatDate, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; articleId: number | null }>({
    open: false,
    articleId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  const loadArticles = async () => {
    setLoading(true);
    const response = await adminApi.getPendingArticles(1, 20);
    setArticles(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveArticle(id);
      toast.success('文章已批准发布');
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error('操作失败');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.articleId || !rejectReason.trim()) {
      toast.error('请填写拒绝原因');
      return;
    }
    try {
      await adminApi.rejectArticle(rejectModal.articleId, rejectReason);
      toast.success('文章已拒绝');
      setArticles((prev) => prev.filter((a) => a.id !== rejectModal.articleId));
      setRejectModal({ open: false, articleId: null });
      setRejectReason('');
    } catch {
      toast.error('操作失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">文章审核</h1>
        <span className="text-sm text-gray-500">待审核: {articles.length} 篇</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                  {article.summary && (
                    <p className="text-gray-600 text-sm mb-3">{truncate(article.summary, 150)}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <img
                        src={article.author.avatar}
                        alt={article.author.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{article.author.username}</span>
                    </div>
                    <span>{formatDate(article.createdAt)}</span>
                    {article.category && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/article/${article.slug}`}
                    target="_blank"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="预览"
                  >
                    <FiEye className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleApprove(article.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                  >
                    <FiCheck className="w-4 h-4" />
                    批准
                  </button>
                  <button
                    onClick={() => setRejectModal({ open: true, articleId: article.id })}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                  >
                    <FiX className="w-4 h-4" />
                    拒绝
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-gray-500">没有待审核的文章</p>
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">拒绝原因</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请填写拒绝原因..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-32 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal({ open: false, articleId: null })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
