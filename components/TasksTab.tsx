'use client'

import { memo } from 'react'
import { Task } from '@/types'
import IntegrationsHub from './IntegrationsHub'

interface TasksTabProps {
  tasks: Task[]
  onCreateTask: () => void
}

function TasksTab({ tasks, onCreateTask }: TasksTabProps) {
  // 날짜/시간이 지정된 작업 (정렬: 날짜 > 시간)
  const scheduledTasks = tasks
    .filter(task => task.scheduledDate || task.scheduledTime)
    .sort((a, b) => {
      // 날짜 비교
      if (a.scheduledDate && b.scheduledDate) {
        const dateCompare = a.scheduledDate.getTime() - b.scheduledDate.getTime()
        if (dateCompare !== 0) return dateCompare
      } else if (a.scheduledDate) return -1
      else if (b.scheduledDate) return 1

      // 같은 날짜라면 시간 비교
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime)
      } else if (a.scheduledTime) return -1
      else if (b.scheduledTime) return 1

      return 0
    })

  // 날짜/시간이 없는 외부 연동 작업 (미분류 - Backlog)
  // 내부(internal) 작업은 제외, 외부 소스(notion, linear, todoist 등)만 표시
  const unscheduledTasks = tasks.filter(
    task => !task.scheduledDate && !task.scheduledTime && task.source !== 'internal'
  )

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* 좌측: 예정된 작업 */}
      <div className="flex-1 md:border-r border-b md:border-b-0 border-zinc-200 dark:border-zinc-800 overflow-auto">
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4">예정된 작업</h2>

          {/* 현재 날짜 표시 */}
          <div className="mb-4 p-3 bg-surface-secondary dark:bg-surface-secondary rounded-lg flex-shrink-0">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>

          {/* 시간대별 작업 - 스크롤 가능 */}
          <div className="space-y-2 flex-1 overflow-auto">
            {scheduledTasks.length > 0 ? (
              scheduledTasks.map(task => (
                <TaskCard key={task.id} task={task} showDateTime />
              ))
            ) : (
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                예정된 작업이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 중앙: 미분류 작업 (Backlog) */}
      <div className="w-full md:w-80 md:border-r border-b md:border-b-0 border-zinc-200 dark:border-zinc-800 overflow-auto bg-surface dark:bg-surface">
        <div className="p-4 h-full flex flex-col">
          <div className="flex-shrink-0 mb-4">
            <h2 className="text-lg font-semibold">미분류 작업</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              외부 연동에서 날짜가 없거나 아직 일정을 정하지 않은 작업
            </p>
          </div>

          {/* 미분류 작업 목록 - 스크롤 가능 */}
          <div className="space-y-2 flex-1 overflow-auto">
            {unscheduledTasks.length > 0 ? (
              unscheduledTasks.map(task => (
                <TaskCard key={task.id} task={task} showDateTime={false} />
              ))
            ) : (
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-8 text-sm">
                미분류 작업이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우측: 외부 연동 허브 */}
      <div className="w-full md:w-[500px] overflow-auto bg-zinc-50 dark:bg-zinc-900">
        <div className="p-4 h-full overflow-auto">
          <IntegrationsHub />
        </div>
      </div>

      {/* 작업 생성 FAB */}
      <button
        onClick={onCreateTask}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  )
}

interface TaskCardProps {
  task: Task
  showDateTime?: boolean
}

function TaskCard({ task, showDateTime = false }: TaskCardProps) {
  const sourceColors = {
    internal: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    notion: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    todoist: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    linear: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    'google-calendar': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  }

  const statusColors = {
    todo: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
    in_progress: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    completed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  }

  return (
    <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{task.title}</h3>
          {task.content && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
              {task.content}
            </p>
          )}
          {/* 날짜/시간 표시 */}
          {showDateTime && (task.scheduledDate || task.scheduledTime) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {task.scheduledDate && (
                <span>
                  📅 {task.scheduledDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {task.scheduledTime && (
                <span>🕐 {task.scheduledTime}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 text-xs rounded ${statusColors[task.status]}`}>
          {task.status === 'todo' ? '할 일' : task.status === 'in_progress' ? '진행 중' : '완료'}
        </span>
        <span className={`px-2 py-0.5 text-xs rounded ${sourceColors[task.source]}`}>
          {task.source === 'internal' ? '내부' :
           task.source === 'notion' ? 'Notion' :
           task.source === 'todoist' ? 'Todoist' :
           task.source === 'linear' ? 'Linear' : task.source}
        </span>
        {task.estimatedDuration && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ⏱ {task.estimatedDuration}분
          </span>
        )}
        {task.priority && (
          <span className={`text-xs ${
            task.priority === 'high' ? 'text-red-600 dark:text-red-400' :
            task.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-zinc-500 dark:text-zinc-400'
          }`}>
            {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '중간' : '낮음'}
          </span>
        )}
      </div>
    </div>
  )
}
export default memo(TasksTab)
