import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const language = searchParams.get('language') || ''
    const tag = searchParams.get('tag') || ''
    const sort = searchParams.get('sort') || 'newest'
    const take = parseInt(searchParams.get('take') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const where: any = { isPublic: true }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (language) {
      where.language = language
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      }
    }

    const orderBy: any = {}
    if (sort === 'newest') {
      orderBy.createdAt = 'desc'
    } else if (sort === 'popular') {
      orderBy.likes = { _count: 'desc' }
    }

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy,
        take,
        skip,
      }),
      prisma.snippet.count({ where }),
    ])

    return NextResponse.json({
      snippets: snippets.map((s) => ({
        ...s,
        tags: s.tags.map((st) => st.tag),
        likes: s._count.likes,
        comments: s._count.comments,
      })),
      total,
      hasMore: skip + take < total,
    })
  } catch (error) {
    console.error('Get snippets error:', error)
    return NextResponse.json({ error: '获取片段失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { title, description, code, language, isPublic, tagNames } = await request.json()

    if (!title || !code || !language) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const snippet = await prisma.$transaction(async (tx) => {
      const tagList = Array.isArray(tagNames) ? tagNames : []

      const snippetRecord = await tx.snippet.create({
        data: {
          title,
          description,
          code,
          language,
          isPublic: isPublic !== false,
          authorId: user.id,
        },
      })

      if (tagList.length > 0) {
        for (const name of tagList) {
          const trimmed = String(name).trim().toLowerCase()
          if (!trimmed) continue
          const tagRecord = await tx.tag.upsert({
            where: { name: trimmed },
            create: { name: trimmed },
            update: {},
          })
          await tx.snippetTag.upsert({
            where: {
              snippetId_tagId: {
                snippetId: snippetRecord.id,
                tagId: tagRecord.id,
              },
            },
            create: {
              snippetId: snippetRecord.id,
              tagId: tagRecord.id,
            },
            update: {},
          })
        }
      }

      return tx.snippet.findUnique({
        where: { id: snippetRecord.id },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          tags: { include: { tag: true } },
        },
      })
    })

    if (!snippet) {
      return NextResponse.json({ error: '创建失败' }, { status: 500 })
    }

    return NextResponse.json({
      ...snippet,
      tags: snippet.tags.map((st: any) => st.tag),
      likes: 0,
      comments: 0,
    }, { status: 201 })
  } catch (error) {
    console.error('Create snippet error:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
