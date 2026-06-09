import { getLanguageLabel } from '@/lib/format'

interface Props {
  language: string
  size?: 'sm' | 'md'
}

const languageColors: Record<string, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  typescript: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  python: 'bg-green-500/20 text-green-400 border-green-500/30',
  java: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cpp: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  csharp: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  html: 'bg-red-500/20 text-red-400 border-red-500/30',
  css: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  rust: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ruby: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  php: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  sql: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  json: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  xml: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  yaml: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  markdown: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  shell: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  bash: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  default: 'bg-dark-700 text-dark-300 border-dark-600',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function LanguageBadge({ language, size = 'sm' }: Props) {
  const color = languageColors[language] || languageColors.default

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${color} ${sizeClasses[size]}`}
    >
      {getLanguageLabel(language)}
    </span>
  )
}
