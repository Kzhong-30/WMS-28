import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const currentUser = await getCurrentUser()
    const user = await prisma.user.findUnique({
      where: { username: params.username },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const isOwner = currentUser?.id === user.id
    if (!isOwner) {
      return NextResponse.json({ error: '无权限查看' }, { status: 403 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        snippet: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            tags: { include: { tag: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      favorites: favorites.map((f) => ({
        ...f.snippet,
        tags: (f.snippet as any).tags.map((st: any) => st.tag),
        likes: (f.snippet as any)._count.likes,
        comments: (f.snippet as any)._count.comments,
        favoritedAt: f.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get user favorites error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
