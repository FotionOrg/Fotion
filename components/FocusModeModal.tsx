'use client'

import { Task, TimerMode } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface FocusModeModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  queuedTaskIds: string[] // Task Queue에 있는 task ID 목록
  defaultTimerDuration: number // 기본 타이머 Time (분)
  onStart: (taskId: string, mode: TimerMode, duration?: number) => void
}

export default function FocusModeModal({ isOpen, onClose, tasks, queuedTaskIds, defaultTimerDuration, onStart }: FocusModeModalProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const resetModal = () => {
    setSearchQuery('')
    setSelectedTask(null)
  }

  useEffect(() => {
    if (isOpen) {
      resetModal()
      // Auto focus on search input
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
    // resetModal은 useEffect 내에서만 호출되므로 의존성에 포함하지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ESC key handler
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

  if (!isOpen) return null

  // Task Queue에 있는 Task들만 표시
  const queuedTasks = queuedTaskIds
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => t !== undefined)

  const filteredTasks = queuedTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStart = () => {
    if (!selectedTask) return

    // 기본 타이머 모드로 Start (Settings에서 지정한 Time 사용)
    const duration = defaultTimerDuration * 60 * 1000
    onStart(selectedTask.id, 'timer', duration)
    onClose()
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
      aria-labelledby="focus-mode-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 id="focus-mode-title" className="text-xl font-semibold">{t('focus.startFocus')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close modal"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Task 검색 */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('task.selectTask')}</label>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('task.searchTasks')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            />
          </div>

          {/* Task 리스트 */}
          <div className="space-y-2 max-h-80 overflow-auto">
            {queuedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  {t('task.queueEmpty')}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {t('task.queueEmptyDescription')}
                </p>
              </div>
            ) : searchQuery ? (
              filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    t={t}
                  />
                ))
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-4 text-sm">
                  {t('task.noSearchResults')}
                </p>
              )
            ) : (
              <>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{t('task.taskQueue')}</p>
                {queuedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    t={t}
                  />
                ))}
              </>
            )}
          </div>

          {/* 타이머 Time 안내 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">⏱️</span>
              <span className="text-blue-700 dark:text-blue-300">
                {t('focus.timerInfo', { duration: defaultTimerDuration })}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t('focus.timerSettingsNote')}
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleStart}
            disabled={!selectedTask}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
          >
            {t('common.start')}
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskItem({ task, isSelected, onSelect, t }: { task: Task; isSelected: boolean; onSelect: () => void; t: any }) {
  const sourceColors = {
    internal: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    notion: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    todoist: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    linear: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    'google-calendar': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  }

  const getSourceLabel = (source: string) => {
    if (source === 'internal') return t('task.internal')
    if (source === 'google-calendar') return 'Google Calendar'
    return source.charAt(0).toUpperCase() + source.slice(1)
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {task.scheduledTime && (
              <span>🕐 {task.scheduledTime}</span>
            )}
            {task.estimatedDuration && (
              <span>⏱ {task.estimatedDuration}{t('common.minute')}</span>
            )}
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${sourceColors[task.source]}`}>
          {getSourceLabel(task.source)}
        </span>
      </div>
    </button>
  )
}
