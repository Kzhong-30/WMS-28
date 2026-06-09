'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Code2, Star } from 'lucide-react'

interface Props {
  username: string
  initialTab: 'snippets' | 'favorites'
  isOwner: boolean
  snippetsCount?: number
  favoritesCount?: number
}

export default function UserProfileClient({
  username,
  initialTab,
  isOwner,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goTab = (tab: 'snippets' | 'favorites') => {
    const params = new URLSearchParams(searchParams)
    if (tab === 'snippets') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.push(
      `/users/${username}${params.toString() ? `?${params.toString()}` : ''}`,
      { scroll: false }
    )
  }

  return (
    <div className="mb-8 flex gap-2 p-1.5 bg-dark-800/50 border border-dark-700 rounded-xl w-fit">
      <button
        onClick={() => goTab('snippets')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
          initialTab === 'snippets'
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
            : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
        }`}
      >
        <Code2 className="w-4.5 h-4.5" />
        发布的片段
      </button>

      {isOwner && (
        <button
          onClick={() => goTab('favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
            initialTab === 'favorites'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
          }`}
        >
          <Star className="w-4.5 h-4.5" />
          我的收藏
        </button>
      )}
    </div>
  )
}
