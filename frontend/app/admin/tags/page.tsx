'use client';

import { useEffect, useState } from 'react';
import { tagsApi } from '@/lib/api';
import { Tag } from '@/types';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');

  const loadTags = async () => {
    setLoading(true);
    const data = await tagsApi.getAll();
    setTags(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setName('');
    setShowModal(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingTag) {
        await tagsApi.update(editingTag.id, { name });
        toast.success('标签已更新');
      } else {
        await tagsApi.create({ name });
        toast.success('标签已创建');
      }
      setShowModal(false);
      loadTags();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      await tagsApi.delete(id);
      toast.success('标签已删除');
      loadTags();
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          新建标签
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
                  <td colSpan={4} className="px-6 py-4">
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">#{tag.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {tag.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tag._count?.articles || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
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
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  暂无标签
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
                {editingTag ? '编辑标签' : '新建标签'}
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
                  placeholder="标签名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  {editingTag ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
