'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-dark-400 hover:text-white rounded-lg hover:bg-dark-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-dark-300 text-sm whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
