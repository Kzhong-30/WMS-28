'use client';

import { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    const data = await categoriesApi.getAll();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, { name, description: description || undefined });
        toast.success('分类已更新');
      } else {
        await categoriesApi.create({ name, description: description || undefined });
        toast.success('分类已创建');
      }
      setShowModal(false);
      loadCategories();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      await categoriesApi.delete(id);
      toast.success('分类已删除');
      loadCategories();
    } catch {
      toast.error('删除失败，请先移除该分类下的文章');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          新建分类
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                文章数
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
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{category.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category._count?.articles || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  暂无分类
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? '编辑分类' : '新建分类'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="分类名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述（可选）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="分类描述"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {editingCategory ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
