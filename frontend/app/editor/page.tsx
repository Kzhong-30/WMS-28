'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { articlesApi, categoriesApi, tagsApi, uploadApi } from '@/lib/api';
import { Category, Tag, ArticleStatus } from '@/types';
import { TipTapEditor } from '@/components/TipTapEditor';
import toast from 'react-hot-toast';
import { FiImage, FiSave, FiSend, FiSettings, FiLoader } from 'react-icons/fi';

export default function EditorPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user) {
      setIsReady(true);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      const [cats, tgs] = await Promise.all([categoriesApi.getAll(), tagsApi.getAll()]);
      setCategories(cats);
      setTags(tgs);
    };
    loadData();
  }, []);

  if (isLoading || !user || !isReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FiLoader className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p className="text-gray-500 text-lg">正在加载编辑器...</p>
          {!isLoading && !user && (
            <p className="text-gray-400 text-sm mt-2">请先登录</p>
          )}
        </div>
      </div>
    );
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const result = await uploadApi.image(file);
      setCoverImage(result.url);
    } catch {
      toast.error('封面上传失败');
    } finally {
      setCoverUploading(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const saveArticle = async (status: ArticleStatus) => {
    if (!title.trim()) {
      toast.error('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入文章内容');
      return;
    }
    try {
      const article = await articlesApi.create({
        title,
        summary: summary || undefined,
        content,
        coverImage: coverImage || undefined,
        status,
        categoryId: categoryId || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      toast.success(status === ArticleStatus.PUBLISHED ? '文章发布成功！' : '草稿保存成功！');
      if (status === ArticleStatus.PUBLISHED) {
        router.push(`/article/${article.slug}`);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '保存失败');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">写文章</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              showSettings
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiSettings className="w-4 h-4" />
            文章设置
          </button>
          <button
            onClick={() => saveArticle(ArticleStatus.DRAFT)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <FiSave className="w-4 h-4" />
            保存草稿
          </button>
          <button
            onClick={() => saveArticle(ArticleStatus.PENDING)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
          >
            <FiSend className="w-4 h-4" />
            提交审核
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题..."
            className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-primary-500 focus:ring-0 px-0 py-3 outline-none transition"
          />

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="文章摘要（可选，用于列表展示和 SEO 优化）..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-20 text-sm"
          />

          <TipTapEditor content={content} onChange={setContent} placeholder="开始创作你的文章..." />
        </div>

        {showSettings && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">封面图</label>
                {coverImage ? (
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="封面"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setCoverImage('')}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded hover:bg-black/70"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition">
                    {coverUploading ? (
                      <span className="text-sm text-gray-500">上传中...</span>
                    ) : (
                      <>
                        <FiImage className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-sm text-gray-500">点击上传封面</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? +e.target.value : null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      type="button"
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">发布说明</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 提交后需要管理员审核才能发布</li>
                  <li>• 草稿可以在"我的文章"中继续编辑</li>
                  <li>• 支持 Markdown 格式的富文本内容</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
