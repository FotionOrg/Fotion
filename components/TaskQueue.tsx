'use client'

import { Task } from '@/types'

interface TaskQueueProps {
  tasks: Task[]
  onRemoveFromQueue?: (taskId: string) => void
  onDrop?: (taskId: string) => void
}

export default function TaskQueue({ tasks, onRemoveFromQueue, onDrop }: TaskQueueProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-primary-50', 'dark:bg-primary-900/20')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary-50', 'dark:bg-primary-900/20')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-primary-50', 'dark:bg-primary-900/20')

    const taskId = e.dataTransfer.getData('taskId')
    if (taskId && onDrop) {
      onDrop(taskId)
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface border-r border-zinc-200 dark:border-zinc-800">
      {/* 헤더 */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-foreground">작업 큐</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          집중할 작업을 여기에 추가하세요
        </p>
      </div>

      {/* 작업 큐 리스트 */}
      <div
        className="flex-1 overflow-y-auto p-4 transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pointer-events-none">
            <svg
              className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              작업 목록에서 드래그하여
              <br />
              작업을 추가하세요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="group relative p-3 bg-background dark:bg-background rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-move"
                draggable
              >
                {/* 순서 표시 */}
                <div className="absolute -left-2 -top-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>

                {/* 작업 내용 */}
                <div className="flex items-start gap-3">
                  {/* 출처 로고 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg">
                    {task.source === 'notion' ? '📋' :
                     task.source === 'linear' ? '🔵' :
                     task.source === 'google-calendar' ? '📅' :
                     '📝'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* 제거 버튼 */}
                  {onRemoveFromQueue && (
                    <button
                      onClick={() => onRemoveFromQueue(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-opacity"
                      title="큐에서 제거"
                    >
                      <svg
                        className="w-4 h-4 text-zinc-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-surface-secondary">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          총 {tasks.length}개 작업
        </p>
      </div>
    </div>
  )
}
