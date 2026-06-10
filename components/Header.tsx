'use client'

import Link from 'next/link'
import { Code2, LogOut, User } from 'lucide-react'

interface UserType {
  id: string
  username: string
  avatar?: string | null
  email?: string
}

export default function Header({ user }: { user: UserType | null }) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

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
              href="/new"
              className="text-dark-300 hover:text-white transition-colors text-sm font-medium"
            >
              发布
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={`/users/${user.username}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white hidden sm:inline">
                    {user.username}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
