'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { User, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiShield, FiUser } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(User & { _count: { articles: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const response = await adminApi.getAllUsers(1, 50);
    setUsers(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success('用户角色已更新');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      toast.error('操作失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <span className="text-sm text-gray-500">共 {users.length} 位用户</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                文章数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注册时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{user.bio}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role === 'ADMIN' ? (
                        <FiShield className="w-3 h-3" />
                      ) : (
                        <FiUser className="w-3 h-3" />
                      )}
                      {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user._count.articles}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    {user.role === 'ADMIN' ? (
                      <button
                        onClick={() => handleRoleChange(user.id, 'USER')}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        取消管理员
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(user.id, 'ADMIN')}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        设为管理员
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  暂无用户
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
