import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      take: 50,
      include: {
        _count: { select: { snippets: true } },
      },
      orderBy: { snippets: { _count: 'desc' } },
    })

    return NextResponse.json({
      tags: tags.map((t) => ({
        ...t,
        count: t._count.snippets,
      })),
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
