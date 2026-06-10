import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import ErrorBoundary from '@/components/ErrorBoundary'
import SnippetDetailClient from '@/components/SnippetDetailClient'
import { DetailSkeleton } from '@/components/Skeletons'

interface Props {
  params: { id: string }
}

async function fetchSnippet(id: string, currentUserId?: string) {
  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, email: true, avatar: true, bio: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
        },
      },
      _count: { select: { likes: true, favorites: true, comments: true } },
    },
  })

  if (!snippet) return null

  if (!snippet.isPublic && snippet.authorId !== currentUserId) {
    return null
  }

  const [isLiked, isFavorited] = currentUserId
    ? await Promise.all([
        prisma.like.findUnique({
          where: { userId_snippetId: { userId: currentUserId, snippetId: id } },
        }),
        prisma.favorite.findUnique({
          where: { userId_snippetId: { userId: currentUserId, snippetId: id } },
        }),
      ])
    : [null, null]

  return {
    snippet,
    isLiked: !!isLiked,
    isFavorited: !!isFavorited,
  }
}

export default async function SnippetDetailPage({ params }: Props) {
  const { id } = params
  const user = await getCurrentUser().catch(() => null)

  const result = await fetchSnippet(id, user?.id)

  if (!result) {
    return notFound()
  }

  const { snippet, isLiked, isFavorited } = result

  const tags = snippet.tags.map((t: any) => ({ id: t.tag.id, name: t.tag.name }))
  const comments = snippet.comments.map((c: any) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    author: c.author,
  }))

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><DetailSkeleton /></div>}>
        <SnippetDetailClient
          snippetId={snippet.id}
          title={snippet.title}
          description={snippet.description}
          code={snippet.code}
          language={snippet.language}
          isPublic={snippet.isPublic}
          authorId={snippet.authorId}
          author={{
            id: snippet.author.id,
            username: snippet.author.username,
            email: snippet.author.email,
            avatar: snippet.author.avatar,
            bio: snippet.author.bio,
          }}
          tags={tags}
          comments={comments}
          initialLikes={snippet._count.likes}
          initialFavorites={snippet._count.favorites}
          initialLiked={isLiked}
          initialFavorited={isFavorited}
          createdAt={snippet.createdAt.toISOString()}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
