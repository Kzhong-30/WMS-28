import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const existing = await prisma.like.findUnique({
      where: { userId_snippetId: { userId: user.id, snippetId: params.id } },
    })

    if (existing) {
      await prisma.like.delete({
        where: { userId_snippetId: { userId: user.id, snippetId: params.id } },
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: { userId: user.id, snippetId: params.id },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Toggle like error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
