'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { articlesApi, commentsApi } from '@/lib/api';
import { Article, Comment } from '@/types';
import { extractHeadings, formatDate, fromNow, formatNumber } from '@/lib/utils';
import {
  FiHeart,
  FiBookmark,
  FiMessageSquare,
  FiEye,
  FiShare2,
  FiSend,
  FiArrowLeft,
} from 'react-icons/fi';
import hljs from 'highlight.js';

interface ArticleClientProps {
  article: Article;
}

export const ArticleClient = ({ article }: ArticleClientProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const [comments, setComments] = useState<Comment[]>(article.comments || []);
  const [newComment, setNewComment] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const headings = extractHeadings(article.content);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, []);

  useEffect(() => {
    if (user) {
      articlesApi.getInteractions(article.slug).then((data) => {
        setLiked(data.liked);
        setFavorited(data.favorited);
      });
    }
    articlesApi.getRelated(article.slug).then(setRelatedArticles);
  }, [article.slug, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const result = await articlesApi.toggleLike(article.id);
    setLiked(result.liked);
    setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
  };

  const handleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const result = await articlesApi.toggleFavorite(article.id);
    setFavorited(result.favorited);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!newComment.trim()) return;
    const comment = await commentsApi.create({ articleId: article.id, content: newComment });
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`http://localhost:3000/article/${article.slug}`);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <FiArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {article.coverImage && (
              <div className="relative h-64 sm:h-80">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                {article.category && (
                  <Link
                    href={`/?category=${article.category.slug}`}
                    className="inline-block bg-primary-50 text-primary-600 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-primary-100 transition"
                  >
                    {article.category.name}
                  </Link>
                )}
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/?tag=${tag.slug}`}
                    className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 transition"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={article.author.avatar}
                    alt={article.author.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{article.author.username}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(article.publishedAt || article.createdAt)} · {fromNow(article.publishedAt || article.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    {formatNumber(article.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiHeart className="w-4 h-4" />
                    {formatNumber(likeCount)}
                  </span>
                </div>
              </div>

              {article.summary && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-primary-500">
                  <p className="text-gray-700 italic">{article.summary}</p>
                </div>
              )}

              <div
                ref={contentRef}
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    liked
                      ? 'bg-red-50 text-red-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{liked ? '已点赞' : '点赞'}</span>
                  <span className="text-sm">({likeCount})</span>
                </button>
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    favorited
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiBookmark className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                  <span>{favorited ? '已收藏' : '收藏'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                >
                  <FiShare2 className="w-5 h-5" />
                  <span>分享</span>
                </button>
              </div>
            </div>
          </article>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5" />
              评论 ({comments.length})
            </h3>

            {user ? (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex gap-3">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="写下你的评论..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSend className="w-4 h-4" />
                        发表评论
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 mb-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-2">请登录后发表评论</p>
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  去登录 →
                </Link>
              </div>
            )}

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.username}
                      className="w-9 h-9 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.author.username}
                        </span>
                        <span className="text-xs text-gray-400">{fromNow(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">暂无评论，来发表第一条评论吧</p>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {headings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">目录</h4>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToHeading(heading.id)}
                      className={`block w-full text-left text-sm py-1.5 px-2 rounded transition ${
                        activeHeading === heading.id
                          ? 'text-primary-600 bg-primary-50 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                    >
                      {heading.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">作者</h4>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={article.author.avatar}
                  alt={article.author.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{article.author.username}</p>
                  {article.author.bio && (
                    <p className="text-xs text-gray-500 line-clamp-2">{article.author.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">相关文章</h4>
                <div className="space-y-3">
                  {relatedArticles.map((ra) => (
                    <Link
                      key={ra.id}
                      href={`/article/${ra.slug}`}
                      className="block group"
                    >
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-primary-600 transition">
                        {ra.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNumber(ra.views)} 阅读 · {formatNumber(ra.likeCount)} 点赞
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
