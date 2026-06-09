'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search, Tag, TrendingUp, Clock } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'
import LanguageBadge from '@/components/LanguageBadge'

export interface FilterState {
  q: string
  language: string
  tag: string
  sort: 'newest' | 'popular'
}

interface Props {
  initial: FilterState
  hotTags: Array<{ id: string; name: string; count: number }>
}

export default function HomeFilters({ initial, hotTags }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(initial.q)
  const [language, setLanguage] = useState(initial.language)
  const [tagFilter, setTagFilter] = useState(initial.tag)
  const [sort, setSort] = useState<'newest' | 'popular'>(initial.sort)

  const updateURL = (next: Partial<FilterState>) => {
    const merged = {
      q: next.q ?? searchValue,
      language: next.language ?? language,
      tag: next.tag ?? tagFilter,
      sort: next.sort ?? sort,
    }
    const params = new URLSearchParams()
    if (merged.q) params.set('q', merged.q)
    if (merged.language) params.set('language', merged.language)
    if (merged.tag) params.set('tag', merged.tag)
    if (merged.sort) params.set('sort', merged.sort)
    router.push(params.toString() ? `/?${params.toString()}` : '/', { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({ q: searchValue })
  }

  const handleLanguage = (val: string) => {
    setLanguage(val)
    updateURL({ language: val })
  }

  const handleTag = (name: string) => {
    const next = tagFilter === name ? '' : name
    setTagFilter(next)
    updateURL({ tag: next })
  }

  const handleSort = (next: 'newest' | 'popular') => {
    setSort(next)
    updateURL({ sort: next })
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
          onChange={(e) => handleLanguage(e.target.value)}
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
            onClick={() => handleSort('newest')}
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
            onClick={() => handleSort('popular')}
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

      {hotTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-dark-800/30 border border-dark-700/50 rounded-xl">
          <div className="flex items-center gap-2 text-dark-400 mr-2">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">热门标签:</span>
          </div>
          {hotTags.slice(0, 12).map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTag(tag.name)}
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

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
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
    </div>
  )
}
