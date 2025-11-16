'use client'

import { Task } from '@/types'
import { useEffect, useRef } from 'react'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
}

export default function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !task) return null

  const sourceLabels = {
    internal: '내부',
    notion: 'Notion',
    linear: 'Linear',
    todoist: 'Todoist',
    'google-calendar': 'Google Calendar',
  }

  const sourceColors = {
    internal: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    notion: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    todoist: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    linear: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    'google-calendar': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="task-detail-title" className="text-xl font-semibold text-foreground">Task 상세</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-foreground"
            aria-label="Close modal"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Title
            </label>
            <p className="text-lg font-semibold text-foreground">{task.title}</p>
          </div>

          {/* 출처 */}
          <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              출처
            </label>
            <span className={`inline-block px-3 py-1 text-sm rounded-lg ${sourceColors[task.source]}`}>
              {sourceLabels[task.source]}
            </span>
          </div>

          {/* 설명 */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                설명
              </label>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  className="text-base text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              </div>
            </div>
          )}

          {/* 예상 소요 Time */}
          {task.estimatedDuration && (
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                예상 소요 Time
              </label>
              <p className="text-base text-foreground">
                {Math.floor(task.estimatedDuration / 60) > 0 && (
                  <span className="font-semibold">{Math.floor(task.estimatedDuration / 60)}Time </span>
                )}
                <span className="font-semibold">{task.estimatedDuration % 60}분</span>
              </p>
            </div>
          )}

          {/* 예정된 Time */}
          {task.scheduledTime && (
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                예정된 Time
              </label>
              <p className="text-base font-mono text-foreground">{task.scheduledTime}</p>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 생성/수정 Date */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <div>
                <span className="font-medium">생성일:</span> {formatDate(task.createdAt)}
              </div>
              <div>
                <span className="font-medium">수정일:</span> {formatDate(task.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-surface-secondary hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium text-foreground"
            tabIndex={0}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
