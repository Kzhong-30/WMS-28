import React, { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SnippetCard from '@/components/SnippetCard'
import MasonryGrid from '@/components/MasonryGrid'
import HomeFilters from '@/components/HomeFilters'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { HomeHeaderSkeleton, SnippetGridSkeleton } from '@/components/Skeletons'

interface PageProps {
  searchParams: {
    q?: string
    language?: string
    tag?: string
    sort?: 'newest' | 'popular'
  }
}

const TAKE = 36

async function SnippetList({
  searchParams,
}: {
  searchParams: PageProps['searchParams']
}) {
  const q = searchParams?.q?.trim() || ''
  const language = searchParams?.language || ''
  const tag = searchParams?.tag || ''
  const sort = searchParams?.sort || 'newest'

  const where: any = { isPublic: true }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { code: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (language) {
    where.language = language
  }
  if (tag) {
    where.tags = { some: { tag: { name: tag } } }
  }

  const orderBy: any =
    sort === 'popular'
      ? [{ _count: { likes: 'desc' } } as any, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }]

  const [raw, total] = await Promise.all([
    prisma.snippet.findMany({
      where,
      take: TAKE,
      orderBy,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.snippet.count({ where }),
  ])

  const snippets = raw.map((s: any) => ({
    ...s,
    tags: s.tags.map((t: any) => ({ id: t.tag.id, name: t.tag.name })),
    likes: s._count.likes,
    comments: s._count.comments,
  }))

  const hasFilters = q || language || tag

  if (snippets.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-dark-400 text-lg mb-4">
          没有找到匹配的代码片段
        </p>
        <div className="flex gap-3 justify-center">
          {hasFilters && (
            <Link
              href="/"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition"
            >
              清除筛选条件
            </Link>
          )}
          <Link
            href="/new"
            className="px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-lg font-medium border border-dark-700 transition inline-block"
          >
            发布第一个片段
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <MasonryGrid columns={3} gap={24} className="mb-8">
        {snippets.map((snippet: any, index: number) => (
          <SnippetCard key={snippet.id} snippet={snippet} index={index} />
        ))}
      </MasonryGrid>

      {total > TAKE && (
        <ScrollToTopButton total={total} shown={snippets.length} />
      )}
    </>
  )
}

export default async function HomePage({ searchParams }: PageProps) {
  const initialFilters = {
    q: searchParams?.q || '',
    language: searchParams?.language || '',
    tag: searchParams?.tag || '',
    sort: (searchParams?.sort as 'newest' | 'popular') || 'newest',
  }

  const rawTags = await prisma.tag.findMany({
    take: 12,
    orderBy: { snippets: { _count: 'desc' } as any },
    include: { _count: { select: { snippets: true } } },
  })
  const hotTags = rawTags.map((r: any) => ({
    id: r.id,
    name: r.name,
    count: Number(r._count.snippets),
  }))

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

      <ErrorBoundary>
        <HomeFilters initial={initialFilters} hotTags={hotTags} />

        <Suspense fallback={<SnippetGridSkeleton count={9} />}>
          <SnippetList searchParams={searchParams || {}} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
