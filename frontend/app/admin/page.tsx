'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { FiUsers, FiFileText, FiCheckCircle, FiClock, FiMessageSquare, FiFolder, FiTag } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalPublished: 0,
    totalPending: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await adminApi.getStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  const statCards = [
    { label: '总用户数', value: stats.totalUsers, icon: FiUsers, color: 'bg-blue-500' },
    { label: '总文章数', value: stats.totalArticles, icon: FiFileText, color: 'bg-purple-500' },
    { label: '已发布', value: stats.totalPublished, icon: FiCheckCircle, color: 'bg-green-500' },
    { label: '待审核', value: stats.totalPending, icon: FiClock, color: 'bg-orange-500' },
    { label: '评论数', value: stats.totalComments, icon: FiMessageSquare, color: 'bg-pink-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">仪表盘</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/admin/articles"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition"
          >
            <FiClock className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">审核文章</p>
              <p className="text-sm text-gray-500">{stats.totalPending} 篇待处理</p>
            </div>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition"
          >
            <FiUsers className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">管理用户</p>
              <p className="text-sm text-gray-500">{stats.totalUsers} 位用户</p>
            </div>
          </a>
          <a
            href="/admin/categories"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition"
          >
            <FiFolder className="w-6 h-6 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">分类管理</p>
              <p className="text-sm text-gray-500">管理文章分类</p>
            </div>
          </a>
          <a
            href="/admin/tags"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition"
          >
            <FiTag className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">标签管理</p>
              <p className="text-sm text-gray-500">管理文章标签</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
