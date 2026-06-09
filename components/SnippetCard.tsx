'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Clock, User } from 'lucide-react'
import { formatRelativeTime, getLanguageLabel, truncate } from '@/lib/format'
import { motion } from 'framer-motion'

interface Tag {
  id: string
  name: string
}

interface Author {
  id: string
  username: string
  avatar: string | null
}

interface Snippet {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  author: Author
  tags: Tag[]
  likes: number
  comments: number
  createdAt: string
}

interface Props {
  snippet: Snippet
  index: number
}

const languageColors: Record<string, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  typescript: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  python: 'bg-green-500/20 text-green-400 border-green-500/30',
  java: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  html: 'bg-red-500/20 text-red-400 border-red-500/30',
  css: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  rust: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  default: 'bg-dark-700 text-dark-300 border-dark-600',
}

export default function SnippetCard({ snippet, index }: Props) {
  const langColor = languageColors[snippet.language] || languageColors.default
  const previewLines = snippet.code.split('\n').slice(0, 10).join('\n')

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5"
    >
      <Link href={`/snippets/${snippet.id}`} className="block">
        <div className="p-5 border-b border-dark-700">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-md border ${langColor}`}
              >
                {getLanguageLabel(snippet.language)}
              </span>
              {snippet.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-dark-700/50 text-dark-300 border border-dark-600"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
            {snippet.title}
          </h3>

          {snippet.description && (
            <p className="text-dark-400 text-sm line-clamp-2 mb-3">
              {snippet.description}
            </p>
          )}

          <div className="relative">
            <pre className="bg-dark-950 rounded-lg p-3 overflow-hidden max-h-40 text-xs">
              <code className="font-mono text-dark-300 whitespace-pre-wrap break-all">
                {truncate(previewLines, 300)}
              </code>
            </pre>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-dark-950 to-transparent pointer-events-none" />
          </div>
        </div>
      </Link>

      <div className="px-5 py-3 flex items-center justify-between">
        <Link
          href={`/users/${snippet.author.username}`}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          {snippet.author.avatar ? (
            <img
              src={snippet.author.avatar}
              alt={snippet.author.username}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center">
              <User className="w-3 h-3 text-dark-400" />
            </div>
          )}
          <span className="text-sm text-dark-300 font-medium">
            {snippet.author.username}
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-dark-400">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {snippet.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {snippet.comments}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatRelativeTime(snippet.createdAt)}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
