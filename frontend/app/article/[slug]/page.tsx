import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articlesApi } from '@/lib/api';
import { ArticleClient } from './ArticleClient';
import { Article } from '@/types';

interface PageProps {
  params: { slug: string };
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const article = await articlesApi.getBySlug(slug);
    return article;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    return { title: '文章不存在 - TechCommunity' };
  }

  return {
    title: `${article.title} - TechCommunity`,
    description: article.summary || article.title,
    keywords: article.tags.map((t) => t.name).join(', '),
    authors: [{ name: article.author.username }],
    openGraph: {
      title: article.title,
      description: article.summary || article.title,
      type: 'article',
      url: `http://localhost:3000/article/${article.slug}`,
      images: article.coverImage ? [article.coverImage] : undefined,
      publishedTime: article.publishedAt,
      tags: article.tags.map((t) => t.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary || article.title,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-8">加载中...</div>}>
      <ArticleClient article={article} />
    </Suspense>
  );
}
