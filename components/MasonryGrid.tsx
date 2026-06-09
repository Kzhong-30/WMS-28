'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface Props {
  children: ReactNode[]
  columns?: number
  gap?: number
  className?: string
}

export default function MasonryGrid({
  children,
  columns: cols = 3,
  gap = 24,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(cols)

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return
      const width = containerRef.current.offsetWidth
      if (width < 640) setColumnCount(1)
      else if (width < 1024) setColumnCount(2)
      else setColumnCount(cols)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [cols])

  const columns: ReactNode[][] = Array.from({ length: columnCount }, () => [])
  children.forEach((child, index) => {
    columns[index % columnCount].push(child)
  })

  return (
    <div
      ref={containerRef}
      className={`flex ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {columns.map((column, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column}
        </div>
      ))}
    </div>
  )
}
