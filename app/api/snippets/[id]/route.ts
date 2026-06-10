import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        tags: { include: { tag: true } },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { likes: true, favorites: true, comments: true },
        },
      },
    })

    if (!snippet) {
      return NextResponse.json({ error: '片段不存在' }, { status: 404 })
    }

    if (!snippet.isPublic && snippet.authorId !== user?.id) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 })
    }

    const isLiked = user
      ? await prisma.like.findUnique({
          where: { userId_snippetId: { userId: user.id, snippetId: params.id } },
        })
      : null

    const isFavorited = user
      ? await prisma.favorite.findUnique({
          where: { userId_snippetId: { userId: user.id, snippetId: params.id } },
        })
      : null

    return NextResponse.json({
      ...snippet,
      tags: snippet.tags.map((st) => st.tag),
      likes: snippet._count.likes,
      favorites: snippet._count.favorites,
      comments: snippet._count.comments,
      isLiked: !!isLiked,
      isFavorited: !!isFavorited,
    })
  } catch (error) {
    console.error('Get snippet error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const snippet = await prisma.snippet.findUnique({ where: { id: params.id } })
    if (!snippet) {
      return NextResponse.json({ error: '片段不存在' }, { status: 404 })
    }

    if (snippet.authorId !== user.id) {
      return NextResponse.json({ error: '无权限删除' }, { status: 403 })
    }

    await prisma.snippet.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete snippet error:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
