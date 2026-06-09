'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import {
  Loader2,
  Send,
  Eye,
  EyeOff,
  Tag,
  X,
  Globe2,
  Lock,
  Code2,
  FileText,
} from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'

const languageMonacoMap: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  html: 'html',
  css: 'css',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  sql: 'sql',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  markdown: 'markdown',
  shell: 'shell',
  bash: 'shell',
}

const defaultCode: Record<string, string> = {
  javascript: `// 欢迎使用 JavaScript
function greet(name) {
  console.log(\`Hello, \${name}!\`)
}

greet('World')`,
  typescript: `// 欢迎使用 TypeScript
interface User {
  id: string
  name: string
  age: number
}

const user: User = {
  id: '1',
  name: 'Alice',
  age: 28,
}`,
  python: `# 欢迎使用 Python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 2rem;
      background: #0f172a;
      color: white;
    }
    h1 { color: #38bdf8; }
  </style>
</head>
<body>
  <h1>Hello CodeSnippet!</h1>
  <p>欢迎体验代码片段平台。</p>
  <script>
    console.log('页面加载完成！')
  </script>
</body>
</html>`,
}

export default function NewSnippetPage() {
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState(defaultCode.javascript)
  const [language, setLanguage] = useState('javascript')
  const [isPublic, setIsPublic] = useState(true)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push('/login')
          return
        }
        setUser(d.user)
      })
      .catch(() => router.push('/login'))
      .finally(() => setCheckingAuth(false))
  }, [router])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '')
    if (!t) return
    if (tags.length >= 5) {
      setError('最多添加 5 个标签')
      return
    }
    if (!tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
    tagInputRef.current?.focus()
  }

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('请填写标题')
      return
    }
    if (!code.trim()) {
      setError('代码内容不能为空')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          code,
          language,
          isPublic,
          tagNames: tags,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '创建失败')
        return
      }

      router.push(`/snippets/${data.id}`)
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Code2 className="w-8 h-8 text-primary-500" />
          创建新代码片段
        </h1>
        <p className="text-dark-400">
          分享你的代码，帮助更多开发者，支持多种编程语言
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 sm:p-6 bg-dark-800/50 border border-dark-700 rounded-2xl space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="为你的代码片段起个简洁明了的标题"
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                描述（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述这个代码片段的用途、实现思路或使用方法"
                rows={3}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                代码编辑器
              </label>
              <div className="monaco-container min-h-[480px]">
                <Editor
                  height="480px"
                  language={languageMonacoMap[language] || 'plaintext'}
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    fontFamily:
                      '"JetBrains Mono", "Fira Code", Consolas, monospace',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 sm:p-6 bg-dark-800/50 border border-dark-700 rounded-2xl space-y-5 sticky top-24">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                编程语言 <span className="text-red-400">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => {
                  const next = e.target.value
                  if (next === language) return
                  const currentDefault = defaultCode[language] || ''
                  const userEdited = code.trim().length > 0 && code !== currentDefault
                  if (userEdited) {
                    const ok = window.confirm(
                      `切换到 ${SUPPORTED_LANGUAGES.find(l=>l.value===next)?.label||next} 语言？\n\n选择“确定”将使用新语言的模板覆盖当前代码，选择“取消”将保留当前代码不变。`
                    )
                    if (ok) {
                      setLanguage(next)
                      setCode(defaultCode[next] || '')
                    }
                  } else {
                    setLanguage(next)
                    if (defaultCode[next]) setCode(defaultCode[next])
                  }
                }}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition appearance-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                标签（最多 5 个）
              </label>
              <div className="p-2 bg-dark-900 border border-dark-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition">
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-600/20 text-primary-400 border border-primary-500/30 rounded-lg text-sm"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-primary-300 p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag()}
                    placeholder={tags.length === 0 ? '输入标签，按回车添加' : ''}
                    className="flex-1 min-w-[80px] px-2 py-1 bg-transparent text-white placeholder-dark-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-dark-500 mt-1.5">
                按 Enter 或逗号添加标签，Backspace 删除
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                可见性
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    isPublic
                      ? 'border-primary-500 bg-primary-600/10'
                      : 'border-dark-700 bg-dark-900 hover:border-dark-600'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                      isPublic ? 'bg-primary-600' : 'bg-dark-700'
                    }`}
                  >
                    <Globe2
                      className={`w-5 h-5 ${
                        isPublic ? 'text-white' : 'text-dark-400'
                      }`}
                    />
                  </div>
                  <p
                    className={`font-medium text-sm ${
                      isPublic ? 'text-white' : 'text-dark-300'
                    }`}
                  >
                    公开
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    所有人可见
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    !isPublic
                      ? 'border-primary-500 bg-primary-600/10'
                      : 'border-dark-700 bg-dark-900 hover:border-dark-600'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                      !isPublic ? 'bg-primary-600' : 'bg-dark-700'
                    }`}
                  >
                    <Lock
                      className={`w-5 h-5 ${
                        !isPublic ? 'text-white' : 'text-dark-400'
                      }`}
                    />
                  </div>
                  <p
                    className={`font-medium text-sm ${
                      !isPublic ? 'text-white' : 'text-dark-300'
                    }`}
                  >
                    私有
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    仅自己可见
                  </p>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    发布中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    发布片段
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 bg-dark-900 hover:bg-dark-800 text-dark-300 hover:text-white font-medium rounded-xl border border-dark-700 transition"
              >
                取消
              </button>
            </div>

            <div className="pt-4 border-t border-dark-700">
              <p className="text-xs text-dark-500">
                提示: 切换编程语言会重置代码模板
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
