export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) return formatDate(d)
  if (diffDay > 0) return `${diffDay} 天前`
  if (diffHour > 0) return `${diffHour} 小时前`
  if (diffMin > 0) return `${diffMin} 分钟前`
  return '刚刚'
}

export function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    html: 'html',
    css: 'css',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    php: 'php',
    sql: 'sql',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    markdown: 'md',
    shell: 'sh',
    bash: 'sh',
  }
  return extensions[language] || 'txt'
}

export function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    html: 'HTML',
    css: 'CSS',
    go: 'Go',
    rust: 'Rust',
    ruby: 'Ruby',
    php: 'PHP',
    sql: 'SQL',
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    markdown: 'Markdown',
    shell: 'Shell',
    bash: 'Bash',
  }
  return labels[language] || language
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
