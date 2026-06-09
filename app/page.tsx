'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import SnippetCard from '@/components/SnippetCard'
import MasonryGrid from '@/components/MasonryGrid'
import LanguageBadge from '@/components/LanguageBadge'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'
import { Filter, Search, Tag, TrendingUp, Clock, Loader2 } from 'lucide-react'

interface Tag {
  id: string
  name: string
  count: number
}

interface Author {
  id: string
  username: string
  avatar: string | null
}

interface Snippet {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  author: Author
  tags: Tag[]
  likes: number
  comments: number
  createdAt: string
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') || ''

  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState(initialQ)
  const [language, setLanguage] = useState(searchParams.get('language') || '')
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (searchValue) params.set('q', searchValue)
    if (language) params.set('language', language)
    if (tagFilter) params.set('tag', tagFilter)
    if (sort) params.set('sort', sort)
    return params.toString() ? `?${params.toString()}` : ''
  }, [searchValue, language, tagFilter, sort])

  const updateURL = useCallback(() => {
    router.push(buildQuery(), { scroll: false })
  }, [buildQuery, router])

  const fetchSnippets = useCallback(
    async (append = false) => {
      if (append) setLoadingMore(true)
      else setLoading(true)

      const skip = append ? snippets.length : 0
      const params = new URLSearchParams()
      if (searchValue) params.set('q', searchValue)
      if (language) params.set('language', language)
      if (tagFilter) params.set('tag', tagFilter)
      if (sort) params.set('sort', sort)
      params.set('skip', String(skip))
      params.set('take', '18')

      try {
        const res = await fetch(`/api/snippets?${params.toString()}`)
        const data = await res.json()
        if (append) {
          setSnippets((prev) => [...prev, ...(data.snippets || [])])
        } else {
          setSnippets(data.snippets || [])
        }
        setHasMore(data.hasMore || false)
      } catch {
        // ignore
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [searchValue, language, tagFilter, sort, snippets.length]
  )

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      setTags(data.tags || [])
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  useEffect(() => {
    updateURL()
    fetchSnippets(false)
  }, [language, tagFilter, sort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
    fetchSnippets(false)
  }

  const clearFilters = () => {
    setSearchValue('')
    setLanguage('')
    setTagFilter('')
    setSort('newest')
    router.push('/', { scroll: false })
  }

  const hasFilters = searchValue || language || tagFilter

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          发现优质代码片段
        </h1>
        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
          探索开发者社区分享的代码片段，从实用工具到算法实现，一键复制即用
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索标题、代码、描述..."
            className="w-full pl-12 pr-4 py-3.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition"
          >
            搜索
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 p-4 bg-dark-800/50 border border-dark-700 rounded-xl">
          <div className="flex items-center gap-2 text-dark-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">筛选:</span>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部语言</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setSort('newest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                sort === 'newest'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-900 text-dark-300 hover:bg-dark-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              最新
            </button>
            <button
              onClick={() => setSort('popular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                sort === 'popular'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-900 text-dark-300 hover:bg-dark-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              最热
            </button>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto px-3 py-1.5 text-sm text-primary-400 hover:text-primary-300 font-medium"
            >
              清除筛选
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-dark-800/30 border border-dark-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-dark-400 mr-2">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">热门标签:</span>
            </div>
            {tags.slice(0, 12).map((tag) => (
              <button
                key={tag.id}
                onClick={() =>
                  setTagFilter(tagFilter === tag.name ? '' : tag.name)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  tagFilter === tag.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-700'
                }`}
              >
                #{tag.name} ({tag.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {hasFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-dark-400">当前筛选:</span>
          {searchValue && (
            <span className="px-3 py-1 bg-primary-600/20 text-primary-400 border border-primary-500/30 rounded-full text-xs font-medium">
              关键词: {searchValue}
            </span>
          )}
          {language && <LanguageBadge language={language} />}
          {tagFilter && (
            <span className="px-3 py-1 bg-primary-600/20 text-primary-400 border border-primary-500/30 rounded-full text-xs font-medium">
              #{tagFilter}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
          <p className="text-dark-400">加载中...</p>
        </div>
      ) : snippets.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-dark-400 text-lg mb-4">
            没有找到匹配的代码片段
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition"
            >
              清除筛选条件
            </button>
          )}
          <Link
            href="/new"
            className="mt-4 inline-block ml-4 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-lg font-medium border border-dark-700 transition"
          >
            发布第一个片段
          </Link>
        </div>
      ) : (
        <>
          <MasonryGrid columns={3} gap={24} className="mb-8">
            {snippets.map((snippet, index) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                index={index}
              />
            ))}
          </MasonryGrid>

          {hasMore && (
            <div className="text-center py-8">
              <button
                onClick={() => fetchSnippets(true)}
                disabled={loadingMore}
                className="px-8 py-3 bg-dark-800 hover:bg-dark-700 disabled:bg-dark-800/50 text-white rounded-xl font-medium border border-dark-700 transition inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    加载中...
                  </>
                ) : (
                  '加载更多'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
