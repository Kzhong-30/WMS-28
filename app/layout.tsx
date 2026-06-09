import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'CodeSnippet - 代码片段分享平台',
  description: '发现、分享和学习优质代码片段的社区平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-dark-700 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-dark-500 text-sm">
              <p>© 2024 CodeSnippet. 发现、分享和学习优质代码片段。</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
