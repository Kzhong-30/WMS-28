'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markdown'
import {
  Copy,
  Download,
  Heart,
  Star,
  MessageCircle,
  Send,
  Trash2,
  User,
  Play,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react'
import {
  formatRelativeTime,
  getFileExtension,
  getLanguageLabel,
} from '@/lib/format'
import { RENDERABLE_LANGUAGES } from '@/lib/languages'
import LanguageBadge from '@/components/LanguageBadge'

interface Tag {
  id: string
  name: string
}

interface Author {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
}

interface Snippet {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  isPublic: boolean
  authorId: string
  author: Author
  tags: Tag[]
  comments: Comment[]
  likes: number
  favorites: number
  isLiked: boolean
  isFavorited: boolean
  createdAt: string
  updatedAt: string
}

const languageMap: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  html: 'markup',
  css: 'css',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  sql: 'sql',
  json: 'json',
  xml: 'markup',
  yaml: 'yaml',
  markdown: 'markdown',
  shell: 'bash',
  bash: 'bash',
}

export default function SnippetDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<
    'like' | 'favorite' | 'delete' | null
  >(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {})
  }, [])

  const fetchSnippet = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/snippets/${id}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '加载失败')
        return
      }
      setSnippet(data)
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchSnippet()
  }, [id])

  useEffect(() => {
    if (snippet?.code && codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [snippet?.code, snippet?.language])

  const handleCopy = async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleDownload = () => {
    if (!snippet) return
    const ext = getFileExtension(snippet.language)
    const blob = new Blob([snippet.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLike = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    setActionLoading('like')
    try {
      const res = await fetch(`/api/snippets/${id}/like`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSnippet((prev) =>
          prev
            ? {
                ...prev,
                isLiked: data.liked,
                likes: data.liked ? prev.likes + 1 : prev.likes - 1,
              }
            : null
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleFavorite = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    setActionLoading('favorite')
    try {
      const res = await fetch(`/api/snippets/${id}/favorite`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setSnippet((prev) =>
          prev
            ? {
                ...prev,
                isFavorited: data.favorited,
                favorites: data.favorited
                  ? prev.favorites + 1
                  : prev.favorites - 1,
              }
            : null
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!snippet || !confirm('确定要删除这个代码片段吗？')) return
    setActionLoading('delete')
    try {
      const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/snippets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setSnippet((prev) =>
          prev
            ? { ...prev, comments: [data, ...prev.comments] }
            : null
        )
        setCommentText('')
      }
    } finally {
      setSubmittingComment(false)
    }
  }

  const isRenderable = snippet
    ? RENDERABLE_LANGUAGES.includes(snippet.language as any)
    : false

  const buildPreviewHtml = (code: string, language: string): string => {
    if (language === 'html') return code
    if (language === 'css') {
      return `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="demo"><h1>CSS 效果预览</h1><p>这是一个演示段落，用于展示样式效果。</p><button class="demo-btn">示例按钮</button></div></body></html>`
    }
    if (language === 'javascript') {
      return `<!DOCTYPE html><html><body><div id="output" style="font-family:monospace;padding:1rem;color:#e2e8f0;background:#0f172a;border-radius:8px;"></div><script>
        const originalLog = console.log;
        const output = document.getElementById('output');
        console.log = function(...args) {
          originalLog.apply(console, args);
          const div = document.createElement('div');
          div.style.padding = '4px 0';
          div.style.borderBottom = '1px solid #1e293b';
          div.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
          output.appendChild(div);
        };
        try {
          ${code}
        } catch(e) {
          const div = document.createElement('div');
          div.style.color = '#f87171';
          div.textContent = '错误: ' + e.message;
          output.appendChild(div);
        }
      <\/script></body></html>`
    }
    return ''
  }

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (error || !snippet) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400 text-lg mb-4">{error || '加载失败'}</p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    )
  }

  const isOwner = currentUser?.id === snippet.authorId

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
                  <LanguageBadge language={snippet.language} size="md" />
                  {snippet.tags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/?tag=${encodeURIComponent(t.name)}`}
                      className="px-2.5 py-1 bg-dark-700/50 text-dark-300 hover:text-white hover:bg-dark-700 border border-dark-600 rounded-md text-xs font-medium transition"
                    >
                      #{t.name}
                    </Link>
                  ))}
                  {!snippet.isPublic && (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-xs font-medium">
                      私有
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {snippet.title}
                </h1>
                {snippet.description && (
                  <p className="text-dark-400">{snippet.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400 mb-6 pb-6 border-b border-dark-700">
              <Link
                href={`/users/${snippet.author.username}`}
                className="flex items-center gap-2 hover:text-white transition"
              >
                {snippet.author.avatar ? (
                  <img
                    src={snippet.author.avatar}
                    alt={snippet.author.username}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="font-medium">{snippet.author.username}</span>
              </Link>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(snippet.createdAt)}
              </span>
            </div>

            <div className="relative group">
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all">
                {isRenderable && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/80 hover:bg-dark-600 text-xs text-dark-200 hover:text-white rounded-lg backdrop-blur-sm border border-dark-600 transition"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        隐藏预览
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        运行预览
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/80 hover:bg-dark-600 text-xs rounded-lg backdrop-blur-sm border border-dark-600 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-dark-300" />
                      <span className="text-dark-300">复制</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/80 hover:bg-dark-600 text-xs text-dark-300 hover:text-white rounded-lg backdrop-blur-sm border border-dark-600 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载
                </button>
              </div>

              <pre
                className="!rounded-2xl !m-0 !bg-dark-950"
                style={{ margin: 0 }}
              >
                <code
                  ref={codeRef}
                  className={`language-${languageMap[snippet.language] || 'javascript'}`}
                >
                  {snippet.code}
                </code>
              </pre>
            </div>

            {isRenderable && showPreview && (
              <div className="mt-4 border-2 border-primary-500/30 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-primary-600/10 border-b border-primary-500/30">
                  <span className="text-sm font-medium text-primary-400 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    实时预览效果
                  </span>
                  <span className="text-xs text-dark-500">
                    {getLanguageLabel(snippet.language)}
                  </span>
                </div>
                <div className="bg-white min-h-[240px]">
                  <iframe
                    ref={iframeRef}
                    srcDoc={buildPreviewHtml(
                      snippet.code,
                      snippet.language
                    )}
                    className="w-full min-h-[320px] border-0"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-dark-700">
              <button
                onClick={handleLike}
                disabled={actionLoading === 'like'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition border ${
                  snippet.isLiked
                    ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                    : 'bg-dark-900 text-dark-300 hover:text-white hover:bg-dark-800 border-dark-700'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${snippet.isLiked ? 'fill-current' : ''}`}
                />
                <span>点赞 {snippet.likes}</span>
              </button>
              <button
                onClick={handleFavorite}
                disabled={actionLoading === 'favorite'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition border ${
                  snippet.isFavorited
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-dark-900 text-dark-300 hover:text-white hover:bg-dark-800 border-dark-700'
                }`}
              >
                <Star
                  className={`w-5 h-5 ${
                    snippet.isFavorited ? 'fill-current' : ''
                  }`}
                />
                <span>收藏 {snippet.favorites}</span>
              </button>
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-900 text-dark-300 border border-dark-700">
                <MessageCircle className="w-5 h-5" />
                <span>评论 {snippet.comments.length}</span>
              </span>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === 'delete'}
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>删除</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-500" />
              评论 ({snippet.comments.length})
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
                      <User className="w-5 h-5 text-dark-400" />
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
                        disabled={submittingComment || !commentText.trim()}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        {submittingComment ? (
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
                <p className="text-dark-400 mb-3">
                  登录后才能发表评论
                </p>
                <Link
                  href="/login"
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition inline-block"
                >
                  立即登录
                </Link>
              </div>
            )}

            <div className="space-y-5">
              {snippet.comments.length === 0 ? (
                <p className="text-center text-dark-500 py-10">
                  还没有评论，来发表第一条吧
                </p>
              ) : (
                snippet.comments.map((c) => (
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
                          <User className="w-5 h-5 text-dark-400" />
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
              href={`/users/${snippet.author.username}`}
              className="flex items-center gap-4 mb-4 hover:opacity-80 transition"
            >
              {snippet.author.avatar ? (
                <img
                  src={snippet.author.avatar}
                  alt={snippet.author.username}
                  className="w-14 h-14 rounded-xl"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-dark-700 flex items-center justify-center">
                  <User className="w-7 h-7 text-dark-400" />
                </div>
              )}
              <div>
                <p className="font-bold text-white text-lg">
                  {snippet.author.username}
                </p>
                <p className="text-sm text-dark-400 truncate">
                  {snippet.author.email}
                </p>
              </div>
            </Link>
            {snippet.author.bio && (
              <p className="text-sm text-dark-400 mb-5 pb-5 border-b border-dark-700">
                {snippet.author.bio}
              </p>
            )}
            {!snippet.author.bio && <div className="mb-5 pb-5 border-b border-dark-700" />}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-900/50 rounded-xl">
                <p className="text-2xl font-bold text-white">
                  {snippet.authorId.length > 0 ? '—' : '0'}
                </p>
                <p className="text-xs text-dark-500 mt-0.5">片段</p>
              </div>
              <div className="text-center p-3 bg-dark-900/50 rounded-xl">
                <p className="text-2xl font-bold text-white">
                  {snippet.likes}
                </p>
                <p className="text-xs text-dark-500 mt-0.5">获赞</p>
              </div>
            </div>
          </div>

          {snippet.tags.length > 0 && (
            <div className="p-6 bg-dark-800/50 border border-dark-700 rounded-2xl">
              <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((t) => (
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
