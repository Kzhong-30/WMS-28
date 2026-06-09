'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart,
  Star,
  MessageCircle,
  Send,
  Trash2,
  User as UserIcon,
  Loader2,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import LanguageBadge from '@/components/LanguageBadge'
import CodeBlock from '@/components/CodeBlock'
import { formatRelativeTime } from '@/lib/format'

interface Author {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
}

interface Tag {
  id: string
  name: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
}

interface Props {
  snippetId: string
  title: string
  description: string | null
  code: string
  language: string
  isPublic: boolean
  authorId: string
  author: Author
  tags: Tag[]
  comments: Comment[]
  initialLikes: number
  initialFavorites: number
  initialLiked: boolean
  initialFavorited: boolean
  createdAt: string
}

export default function SnippetDetailClient(props: Props) {
  const router = useRouter()
  const {
    snippetId,
    title,
    description,
    code,
    language,
    isPublic,
    authorId,
    author,
    tags,
    comments: initComments,
    initialLikes,
    initialFavorites,
    initialLiked,
    initialFavorited,
    createdAt,
  } = props

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [favorites, setFavorites] = useState(initialFavorites)
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [comments, setComments] = useState<Comment[]>(initComments)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [action, setAction] = useState<'like' | 'favorite' | 'delete' | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {})
  }, [])

  const goLogin = () => router.push('/login')

  const handleLike = async () => {
    if (!currentUser) return goLogin()
    setAction('like')
    try {
      const res = await fetch(`/api/snippets/${snippetId}/like`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setIsLiked(data.liked)
        setLikes((n) => (data.liked ? n + 1 : n - 1))
      }
    } finally {
      setAction(null)
    }
  }

  const handleFavorite = async () => {
    if (!currentUser) return goLogin()
    setAction('favorite')
    try {
      const res = await fetch(`/api/snippets/${snippetId}/favorite`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setIsFavorited(data.favorited)
        setFavorites((n) => (data.favorited ? n + 1 : n - 1))
      }
    } finally {
      setAction(null)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个代码片段吗？此操作不可恢复。')) return
    setAction('delete')
    try {
      const res = await fetch(`/api/snippets/${snippetId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
        router.refresh()
      }
    } finally {
      setAction(null)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return goLogin()
    const content = commentText.trim()
    if (!content) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/snippets/${snippetId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments((list) => [data, ...list])
        setCommentText('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isOwner = currentUser?.id === authorId

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <LanguageBadge language={language} size="md" />
                  {tags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/?tag=${encodeURIComponent(t.name)}`}
                      className="px-2.5 py-1 bg-dark-700/50 text-dark-300 hover:text-white hover:bg-dark-700 border border-dark-600 rounded-md text-xs font-medium transition"
                    >
                      #{t.name}
                    </Link>
                  ))}
                  {!isPublic && (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-xs font-medium">
                      私有
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {title}
                </h1>
                {description && (
                  <p className="text-dark-400">{description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400 mb-6 pb-6 border-b border-dark-700">
              <Link
                href={`/users/${author.username}`}
                className="flex items-center gap-2 hover:text-white transition"
              >
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.username}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                <span className="font-medium">{author.username}</span>
              </Link>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(createdAt)}
              </span>
            </div>

            <CodeBlock
              snippetId={snippetId}
              title={title}
              code={code}
              language={language}
            />

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-dark-700">
              <button
                onClick={handleLike}
                disabled={action === 'like'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition border ${
                  isLiked
                    ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                    : 'bg-dark-900 text-dark-300 hover:text-white hover:bg-dark-800 border-dark-700'
                } disabled:opacity-60`}
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                />
                <span>点赞 {likes}</span>
              </button>
              <button
                onClick={handleFavorite}
                disabled={action === 'favorite'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition border ${
                  isFavorited
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-dark-900 text-dark-300 hover:text-white hover:bg-dark-800 border-dark-700'
                } disabled:opacity-60`}
              >
                <Star
                  className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
                />
                <span>收藏 {favorites}</span>
              </button>
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-900 text-dark-300 border border-dark-700">
                <MessageCircle className="w-5 h-5" />
                <span>评论 {comments.length}</span>
              </span>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={action === 'delete'}
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition disabled:opacity-60"
                >
                  {action === 'delete' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span>{action === 'delete' ? '删除中' : '删除'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-500" />
              评论 ({comments.length})
            </h2>

            {currentUser ? (
              <form onSubmit={submitComment} className="mb-8">
                <div className="flex gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5 text-dark-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="写下你的评论..."
                      rows={3}
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !commentText.trim()}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            发送中...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            发表评论
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-5 bg-dark-900/50 border border-dark-700 rounded-xl text-center">
                <p className="text-dark-400 mb-3">登录后才能发表评论</p>
                <Link
                  href="/login"
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition inline-block"
                >
                  立即登录
                </Link>
              </div>
            )}

            <div className="space-y-5">
              {comments.length === 0 ? (
                <p className="text-center text-dark-500 py-10">
                  还没有评论，来发表第一条吧
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3 animate-fade-in">
                    <Link
                      href={`/users/${c.author.username}`}
                      className="shrink-0"
                    >
                      {c.author.avatar ? (
                        <img
                          src={c.author.avatar}
                          alt={c.author.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-dark-400" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Link
                          href={`/users/${c.author.username}`}
                          className="font-medium text-white hover:text-primary-400 transition"
                        >
                          {c.author.username}
                        </Link>
                        <span className="text-xs text-dark-500">
                          {formatRelativeTime(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-dark-300 whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-dark-800/50 border border-dark-700 rounded-2xl sticky top-24">
            <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">
              作者信息
            </h3>
            <Link
              href={`/users/${author.username}`}
              className="flex items-center gap-4 mb-4 hover:opacity-80 transition"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.username}
                  className="w-14 h-14 rounded-xl"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-dark-700 flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-dark-400" />
                </div>
              )}
              <div>
                <p className="font-bold text-white text-lg">
                  {author.username}
                </p>
                <p className="text-sm text-dark-400 truncate max-w-[200px]">
                  {author.email}
                </p>
              </div>
            </Link>
            {author.bio ? (
              <p className="text-sm text-dark-400 mb-5 pb-5 border-b border-dark-700">
                {author.bio}
              </p>
            ) : (
              <div className="mb-5 pb-5 border-b border-dark-700" />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href={`/users/${author.username}`}
                className="text-center p-3 bg-dark-900/50 rounded-xl hover:bg-dark-900 transition block"
              >
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-xs text-dark-500 mt-0.5">片段</p>
              </Link>
              <div className="text-center p-3 bg-dark-900/50 rounded-xl">
                <p className="text-2xl font-bold text-white">{likes}</p>
                <p className="text-xs text-dark-500 mt-0.5">获赞</p>
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="p-6 bg-dark-800/50 border border-dark-700 rounded-2xl">
              <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/?tag=${encodeURIComponent(t.name)}`}
                    className="px-3 py-1.5 bg-dark-900 text-dark-300 hover:text-white hover:bg-dark-700 border border-dark-700 rounded-lg text-sm font-medium transition"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
