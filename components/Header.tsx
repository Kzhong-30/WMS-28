'use client'

import Link from 'next/link'
import { Code2 } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-dark-700 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-7 h-7 text-primary-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              CodeSnippet
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-dark-300 hover:text-white transition-colors text-sm font-medium"
            >
              发现
            </Link>
            <Link
              href="/snippets/new"
              className="text-dark-300 hover:text-white transition-colors text-sm font-medium"
            >
              发布
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              注册
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
