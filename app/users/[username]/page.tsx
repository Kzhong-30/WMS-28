'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  Code2,
  Star,
  User as UserIcon,
  Calendar,
  Mail,
  Loader2,
} from 'lucide-react'
import SnippetCard from '@/components/SnippetCard'
import MasonryGrid from '@/components/MasonryGrid'
import { formatDate } from '@/lib/format'

interface Tag {
  id: string
  name: string
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

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'snippets' | 'favorites'>('snippets')
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [favorites, setFavorites] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingTab, setLoadingTab] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {})
  }, [])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${username}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '用户不存在')
        return
      }
      setProfile(data.user)
    } catch {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }, [username])

  const fetchSnippets = useCallback(async () => {
    setLoadingTab(true)
    try {
      const res = await fetch(`/api/users/${username}/snippets`)
      const data = await res.json()
      setSnippets(data.snippets || [])
    } finally {
      setLoadingTab(false)
    }
  }, [username])

  const fetchFavorites = useCallback(async () => {
    setLoadingTab(true)
    try {
      const res = await fetch(`/api/users/${username}/favorites`)
      const data = await res.json()
      setFavorites(data.favorites || [])
    } finally {
      setLoadingTab(false)
    }
  }, [username])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (activeTab === 'snippets') {
      fetchSnippets()
    } else if (profile) {
      if (currentUser?.id === profile.id) {
        fetchFavorites()
      }
    }
  }, [activeTab, profile, currentUser, fetchSnippets, fetchFavorites])

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400 text-lg mb-4">{error || '用户不存在'}</p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg"
        >
          返回首页
        </Link>
      </div>
    )
  }

  const isOwner = currentUser?.id === profile.id
  const displayList = activeTab === 'snippets' ? snippets : favorites

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 p-6 sm:p-10 bg-gradient-to-br from-primary-600/10 via-dark-800/50 to-dark-800/50 border border-dark-700 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-2xl border-4 border-dark-800"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-dark-700 flex items-center justify-center shadow-2xl border-4 border-dark-800">
                <UserIcon className="w-14 h-14 text-dark-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {profile.username}
                </h1>
                {profile.bio ? (
                  <p className="text-dark-300 max-w-xl">{profile.bio}</p>
                ) : isOwner ? (
                  <p className="text-dark-500 italic">点击设置添加个人简介...</p>
                ) : null}
              </div>
              {isOwner && (
                <Link
                  href="/new"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition flex items-center gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  发布片段
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                加入于 {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 max-w-lg">
          <div className="p-4 sm:p-5 bg-dark-900/60 rounded-2xl border border-dark-700/50 backdrop-blur-sm">
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {profile._count?.snippets || 0}
            </p>
            <p className="text-sm text-dark-400 mt-1">发布片段</p>
          </div>
          <div className="p-4 sm:p-5 bg-dark-900/60 rounded-2xl border border-dark-700/50 backdrop-blur-sm">
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {profile._count?.favorites || 0}
            </p>
            <p className="text-sm text-dark-400 mt-1">收藏</p>
          </div>
          <div className="p-4 sm:p-5 bg-dark-900/60 rounded-2xl border border-dark-700/50 backdrop-blur-sm">
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {snippets.reduce((acc, s) => acc + (s.likes || 0), 0)}
            </p>
            <p className="text-sm text-dark-400 mt-1">累计获赞</p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex gap-2 p-1.5 bg-dark-800/50 border border-dark-700 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
            activeTab === 'snippets'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
          }`}
        >
          <Code2 className="w-4.5 h-4.5" />
          发布的片段
          <span
            className={`ml-1 px-2 py-0.5 rounded-md text-xs font-medium ${
              activeTab === 'snippets'
                ? 'bg-white/20'
                : 'bg-dark-700 text-dark-400'
            }`}
          >
            {snippets.length}
          </span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
              activeTab === 'favorites'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <Star className="w-4.5 h-4.5" />
            我的收藏
            <span
              className={`ml-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                activeTab === 'favorites'
                  ? 'bg-white/20'
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              {favorites.length}
            </span>
          </button>
        )}
      </div>

      {loadingTab ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-dark-800 flex items-center justify-center">
            {activeTab === 'snippets' ? (
              <Code2 className="w-10 h-10 text-dark-500" />
            ) : (
              <Star className="w-10 h-10 text-dark-500" />
            )}
          </div>
          <p className="text-dark-400 text-lg mb-4">
            {activeTab === 'snippets'
              ? isOwner
                ? '你还没有发布任何代码片段'
                : `${profile.username} 还没有发布任何代码片段`
              : '收藏夹还是空的'}
          </p>
          {activeTab === 'snippets' && isOwner && (
            <Link
              href="/new"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition inline-flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              发布第一个片段
            </Link>
          )}
          {activeTab === 'favorites' && (
            <Link
              href="/"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition inline-flex items-center gap-2"
            >
              去发现好片段
            </Link>
          )}
        </div>
      ) : (
        <MasonryGrid columns={3} gap={24}>
          {displayList.map((snippet, index) => (
            <SnippetCard
              key={snippet.id + '-' + activeTab}
              snippet={snippet}
              index={index}
            />
          ))}
        </MasonryGrid>
      )}
    </div>
  )
}
