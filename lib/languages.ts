export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'csharp', label: 'C#', icon: '🎯' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'sql', label: 'SQL', icon: '🗃️' },
  { value: 'json', label: 'JSON', icon: '📋' },
  { value: 'xml', label: 'XML', icon: '📄' },
  { value: 'yaml', label: 'YAML', icon: '📝' },
  { value: 'markdown', label: 'Markdown', icon: '📑' },
  { value: 'shell', label: 'Shell', icon: '💻' },
  { value: 'bash', label: 'Bash', icon: '🐚' },
] as const

export const RENDERABLE_LANGUAGES = ['html', 'css', 'javascript'] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['value']
