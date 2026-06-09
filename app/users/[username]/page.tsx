import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
  Code2,
  Star,
  User as UserIcon,
  Calendar,
  Mail,
} from 'lucide-react'
import SnippetCard from '@/components/SnippetCard'
import MasonryGrid from '@/components/MasonryGrid'
import UserProfileClient from '@/components/UserProfileClient'
import { ProfileSkeleton, SnippetGridSkeleton } from '@/components/Skeletons'
import ErrorBoundary from '@/components/ErrorBoundary'
import { formatDate } from '@/lib/format'

interface Props {
  params: { username: string }
  searchParams: { tab?: 'snippets' | 'favorites' }
}

async function fetchUserAndData(
  username: string,
  currentUserId?: string
) {
  const profile = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { snippets: true, favorites: true } },
    },
  })

  if (!profile) return null

  const isOwner = profile.id === currentUserId

  const snippetInclude = {
    author: { select: { id: true, username: true, avatar: true } },
    tags: { include: { tag: { select: { id: true, name: true } } } },
    _count: { select: { likes: true, comments: true } },
  } as const

  const [snippetsRaw, likedLikesRaw] = await Promise.all([
    prisma.snippet.findMany({
      where: isOwner
        ? { authorId: profile.id }
        : { authorId: profile.id, isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: snippetInclude,
    }),
    prisma.like.aggregate({
      where: {
        snippet: { authorId: profile.id },
      },
      _count: true,
    }),
  ])

  const totalLikes = likedLikesRaw._count

  const snippets = snippetsRaw.map((s: any) => ({
    ...s,
    tags: s.tags.map((t: any) => ({ id: t.tag.id, name: t.tag.name })),
    likes: s._count.likes,
    comments: s._count.comments,
  }))

  let favorites: any[] = []
  if (isOwner) {
    const favRows = await prisma.favorite.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { snippet: { include: snippetInclude as any } },
    })
    const favRaw = favRows
      .filter((r) => r.snippet && (r.snippet.isPublic || (r.snippet as any).authorId === profile.id))
      .map((r) => r.snippet)
    favorites = favRaw.map((s: any) => ({
      ...s,
      tags: s.tags.map((t: any) => ({ id: t.tag.id, name: t.tag.name })),
      likes: s._count.likes,
      comments: s._count.comments,
    }))
  }

  return { profile, isOwner, snippets, favorites, totalLikes }
}

export default async function UserProfilePage({ params, searchParams }: Props) {
  const { username } = params
  const currentUser = await getCurrentUser().catch(() => null)
  const initialTab = searchParams?.tab === 'favorites' ? 'favorites' : 'snippets'

  const result = await fetchUserAndData(username, currentUser?.id)

  if (!result) return notFound()

  const { profile, isOwner, snippets, favorites, totalLikes } = result

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <ProfileSkeleton />
            <SnippetGridSkeleton count={6} />
          </div>
        }
      >
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
                      <p className="text-dark-500 italic">
                        点击设置添加个人简介...
                      </p>
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
                  {profile._count.snippets}
                </p>
                <p className="text-sm text-dark-400 mt-1">发布片段</p>
              </div>
              <div className="p-4 sm:p-5 bg-dark-900/60 rounded-2xl border border-dark-700/50 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {profile._count.favorites}
                </p>
                <p className="text-sm text-dark-400 mt-1">收藏</p>
              </div>
              <div className="p-4 sm:p-5 bg-dark-900/60 rounded-2xl border border-dark-700/50 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {totalLikes}
                </p>
                <p className="text-sm text-dark-400 mt-1">累计获赞</p>
              </div>
            </div>
          </div>

          <UserProfileClient
            username={profile.username}
            initialTab={initialTab}
            isOwner={isOwner}
          />

          <Suspense fallback={<SnippetGridSkeleton count={6} />}>
            <ProfileContent
              username={profile.username}
              initialTab={initialTab}
              isOwner={isOwner}
              snippets={snippets}
              favorites={favorites}
            />
          </Suspense>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

function ProfileContent({
  username,
  initialTab,
  isOwner,
  snippets,
  favorites,
}: {
  username: string
  initialTab: string
  isOwner: boolean
  snippets: any[]
  favorites: any[]
}) {
  const activeTab = initialTab
  const list = activeTab === 'favorites' ? favorites : snippets
  const empty = (
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
            : `${username} 还没有发布任何代码片段`
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
  )

  if (list.length === 0) return empty

  return (
    <MasonryGrid columns={3} gap={24}>
      {list.map((snippet: any, index: number) => (
        <SnippetCard key={snippet.id} snippet={snippet} index={index} />
      ))}
    </MasonryGrid>
  )
}
