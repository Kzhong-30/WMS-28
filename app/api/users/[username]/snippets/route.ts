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

    const snippets = await prisma.snippet.findMany({
      where: {
        authorId: user.id,
        ...(isOwner ? {} : { isPublic: true }),
      },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      snippets: snippets.map((s) => ({
        ...s,
        tags: s.tags.map((st) => st.tag),
        likes: s._count.likes,
        comments: s._count.comments,
      })),
    })
  } catch (error) {
    console.error('Get user snippets error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
