'use client'

import { useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import { Copy, Check, Download, Play, EyeOff } from 'lucide-react'
import { getFileExtension, getLanguageLabel } from '@/lib/format'
import { RENDERABLE_LANGUAGES } from '@/lib/languages'

async function loadPrismLanguage(language: string): Promise<void> {
  switch (language) {
    case 'javascript':
      await import('prismjs/components/prism-javascript')
      break
    case 'typescript':
      await import('prismjs/components/prism-typescript')
      break
    case 'python':
      await import('prismjs/components/prism-python')
      break
    case 'java':
      await import('prismjs/components/prism-java')
      break
    case 'cpp':
      await import('prismjs/components/prism-c')
      await import('prismjs/components/prism-cpp')
      break
    case 'csharp':
      await import('prismjs/components/prism-csharp')
      break
    case 'html':
    case 'xml':
      await import('prismjs/components/prism-markup')
      break
    case 'css':
      await import('prismjs/components/prism-css')
      break
    case 'go':
      await import('prismjs/components/prism-go')
      break
    case 'rust':
      await import('prismjs/components/prism-rust')
      break
    case 'ruby':
      await import('prismjs/components/prism-ruby')
      break
    case 'php':
      await import('prismjs/components/prism-php')
      break
    case 'sql':
      await import('prismjs/components/prism-sql')
      break
    case 'json':
      await import('prismjs/components/prism-json')
      break
    case 'yaml':
      await import('prismjs/components/prism-yaml')
      break
    case 'markdown':
      await import('prismjs/components/prism-markdown')
      break
    case 'shell':
    case 'bash':
      await import('prismjs/components/prism-bash')
      break
    default:
      break
  }
}

const LANG_ALIAS: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  html: 'markup',
  css: 'css',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  sql: 'sql',
  json: 'json',
  xml: 'markup',
  yaml: 'yaml',
  markdown: 'markdown',
  shell: 'bash',
  bash: 'bash',
}

interface Props {
  snippetId: string
  title: string
  code: string
  language: string
}

export default function CodeBlock({ snippetId, title, code, language }: Props) {
  const codeRef = useRef<HTMLElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const langClass = LANG_ALIAS[language] || 'javascript'
  const isRenderable = RENDERABLE_LANGUAGES.includes(language as any)

  useEffect(() => {
    let cancelled = false
    loadPrismLanguage(language)
      .catch((err) => {
        console.warn(`[CodeBlock] 动态加载 Prism 语言模块失败 ${language}:`, err)
      })
      .finally(() => {
        if (cancelled) return
        setLoaded(true)
        setTimeout(() => {
          if (codeRef.current && !cancelled) {
            try {
              Prism.highlightElement(codeRef.current)
            } catch (e) {
              console.warn('[CodeBlock] 高亮失败:', e)
            }
          }
        }, 0)
      })
    return () => {
      cancelled = true
    }
  }, [code, language])

  useEffect(() => {
    if (loaded && codeRef.current) {
      try {
        Prism.highlightElement(codeRef.current)
      } catch (e) {
        console.warn('[CodeBlock] re-highlight 失败:', e)
      }
    }
  }, [loaded, code])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.warn('[CodeBlock] 复制失败:', e)
    }
  }

  const handleDownload = () => {
    const ext = getFileExtension(language)
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const buildSrcDoc = () => {
    if (language === 'html') return code
    if (language === 'css') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${code}</style></head><body><div style="padding:2rem;font-family:-apple-system,sans-serif;max-width:720px"><h1 style="color:#0ea5e9">CSS 效果预览</h1><p>这是一个演示段落，用于展示样式效果。</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><button class="demo-btn" style="margin-top:1rem;padding:0.5rem 1rem">示例按钮</button><ul style="margin-top:1rem"><li>项目一</li><li>项目二</li><li>项目三</li></ul></div></body></html>`
    }
    if (language === 'javascript') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0"><div id="output" style="font-family:'JetBrains Mono',Consolas,monospace;padding:1rem;color:#e2e8f0;background:#0f172a;min-height:100vh;"></div><script>
        const output = document.getElementById('output');
        const origLog = console.log;
        const origErr = console.error;
        const origWarn = console.warn;
        function append(text, color) {
          const div = document.createElement('div');
          div.style.padding = '6px 0';
          div.style.borderBottom = '1px solid #1e293b';
          div.style.whiteSpace = 'pre-wrap';
          div.style.wordBreak = 'break-word';
          if (color) div.style.color = color;
          div.textContent = text;
          output.appendChild(div);
        }
        console.log = (...args) => { append(args.map(a => typeof a === 'object' ? JSON.stringify(a,null,2) : String(a)).join(' ')); origLog.apply(console,args); }
        console.error = (...args) => { append(args.map(a => typeof a === 'object' ? JSON.stringify(a,null,2) : String(a)).join(' '), '#f87171'); origErr.apply(console,args); }
        console.warn = (...args) => { append(args.map(a => typeof a === 'object' ? JSON.stringify(a,null,2) : String(a)).join(' '), '#fbbf24'); origWarn.apply(console,args); }
        try {
          ${code}
        } catch (err) {
          append('执行错误: ' + err.message + '\\n' + (err.stack || ''), '#f87171');
        }
      <\/script></body></html>`
    }
    return ''
  }

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isRenderable && (
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/90 hover:bg-dark-600 text-xs text-dark-200 hover:text-white rounded-lg backdrop-blur border border-dark-600 transition"
          >
            {showPreview ? (
              <><EyeOff className="w-3.5 h-3.5" />隐藏预览</>
            ) : (
              <><Play className="w-3.5 h-3.5" />运行预览</>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/90 hover:bg-dark-600 text-xs rounded-lg backdrop-blur border border-dark-600 transition"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">已复制</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5 text-dark-300" /><span className="text-dark-300">复制</span></>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/90 hover:bg-dark-600 text-xs text-dark-300 hover:text-white rounded-lg backdrop-blur border border-dark-600 transition"
        >
          <Download className="w-3.5 h-3.5" />
          下载
        </button>
      </div>

      <pre className="!rounded-2xl !m-0 !bg-dark-950" style={{ margin: 0 }}>
        <code ref={codeRef} className={`language-${langClass}`}>
          {code}
        </code>
      </pre>

      {isRenderable && showPreview && (
        <div className="mt-4 border-2 border-primary-500/30 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-primary-600/10 border-b border-primary-500/30">
            <span className="text-sm font-medium text-primary-400 flex items-center gap-2">
              <Play className="w-4 h-4" />
              实时渲染效果
            </span>
            <span className="text-xs text-dark-500">{getLanguageLabel(language)}</span>
          </div>
          <iframe
            key={snippetId + '-' + showPreview}
            srcDoc={buildSrcDoc()}
            className="w-full min-h-[360px] border-0 bg-white"
            title={`snippet-${snippetId}-preview`}
            sandbox="allow-scripts allow-modals"
          />
        </div>
      )}
    </div>
  )
}
