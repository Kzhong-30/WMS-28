'use client'

export default function ScrollToTopButton({ total, shown }: { total: number; shown: number }) {
  return (
    <div className="text-center py-8">
      <p className="text-dark-500 text-sm mb-3">
        共 {total} 个片段，当前展示前 {shown} 条
      </p>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="px-8 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-medium border border-dark-700 transition inline-flex items-center gap-2"
      >
        回到顶部查看更多
      </button>
    </div>
  )
}
