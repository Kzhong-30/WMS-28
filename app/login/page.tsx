'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Code2, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body =
        mode === 'login'
          ? { username: formData.username, password: formData.password }
          : formData

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '操作失败')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">CodeSnippet</span>
        </Link>

        <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-dark-700">
            <button
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`flex-1 py-4 font-medium transition ${
                mode === 'login'
                  ? 'text-white bg-dark-700/50 border-b-2 border-primary-500'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`flex-1 py-4 font-medium transition ${
                mode === 'register'
                  ? 'text-white bg-dark-700/50 border-b-2 border-primary-500'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {mode === 'login' ? '用户名或邮箱' : '用户名'}
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder={mode === 'login' ? '输入用户名或邮箱' : '设置一个用户名'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                密码
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder={mode === 'login' ? '输入密码' : '至少 6 个字符'}
              />
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  处理中...
                </>
              ) : mode === 'login' ? (
                '登录'
              ) : (
                '创建账号'
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-sm text-dark-400">
                {mode === 'login' ? '还没有账号？' : '已有账号？'}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setError('')
                  }}
                  className="text-primary-400 hover:text-primary-300 font-medium ml-1"
                >
                  {mode === 'login' ? '立即注册' : '去登录'}
                </button>
              </p>
            </div>

            <div className="pt-4 border-t border-dark-700 mt-4">
              <p className="text-xs text-dark-500 text-center mb-3">
                演示账号（密码均为 123456）
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ username: 'alice', email: '', password: '123456' })
                    setMode('login')
                  }}
                  className="py-2 px-2 bg-dark-900 hover:bg-dark-700 rounded-lg text-dark-300 border border-dark-700 transition"
                >
                  alice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ username: 'bob', email: '', password: '123456' })
                    setMode('login')
                  }}
                  className="py-2 px-2 bg-dark-900 hover:bg-dark-700 rounded-lg text-dark-300 border border-dark-700 transition"
                >
                  bob
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ username: 'charlie', email: '', password: '123456' })
                    setMode('login')
                  }}
                  className="py-2 px-2 bg-dark-900 hover:bg-dark-700 rounded-lg text-dark-300 border border-dark-700 transition"
                >
                  charlie
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
