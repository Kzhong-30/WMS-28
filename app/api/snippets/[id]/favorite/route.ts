import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_snippetId: { userId: user.id, snippetId: params.id } },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_snippetId: { userId: user.id, snippetId: params.id } },
      })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.favorite.create({
        data: { userId: user.id, snippetId: params.id },
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
