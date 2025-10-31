'use client'

import { Task } from '@/types'
import { useState } from 'react'
import { getTaskColorClasses, TASK_COLORS } from '@/lib/colors'
import { useTranslations } from 'next-intl'

interface TaskListProps {
  tasks: Task[]
  queuedTaskIds?: string[] // Task Queue에 있는 task ID 목록
  onAddToQueue?: (taskId: string) => void
  onTaskClick?: (task: Task) => void
  onCreateTask: () => void
  onConnectExternal: () => void
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void
}

export default function TaskList({
  tasks,
  queuedTaskIds = [],
  onAddToQueue,
  onTaskClick,
  onCreateTask,
  onConnectExternal,
  onUpdateTask,
}: TaskListProps) {
  const t = useTranslations()
  const [colorPickerTaskId, setColorPickerTaskId] = useState<string | null>(null)

  // Task Queue에 없는 Task만 필터링
  const availableTasks = tasks.filter(task => !queuedTaskIds.includes(task.id))

  // 내부 Task과 외부 연동 Task 분리
  const internalTasks = availableTasks.filter(task => task.source === 'internal' || !task.source)
  const notionTasks = availableTasks.filter(task => task.source === 'notion')
  const linearTasks = availableTasks.filter(task => task.source === 'linear')
  const calendarTasks = availableTasks.filter(task => task.source === 'google-calendar')

  const [activeSection, setActiveSection] = useState<string>('internal')

  const sections = [
    { id: 'internal', title: t('task.myTasks'), tasks: internalTasks, icon: '📝' },
    { id: 'notion', title: 'Notion', tasks: notionTasks, icon: '📋', external: true },
    { id: 'linear', title: 'Linear', tasks: linearTasks, icon: '🔵', external: true },
    { id: 'calendar', title: 'Google Calendar', tasks: calendarTasks, icon: '📅', external: true },
  ]

  const handleColorChange = (taskId: string, colorName: string) => {
    console.log('TaskList - Color change:', { taskId, colorName })
    onUpdateTask?.(taskId, { color: colorName })
    setColorPickerTaskId(null)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 헤더 */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t('task.taskList')}</h2>
          <div className="flex gap-2">
            <button
              onClick={onConnectExternal}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              {t('task.externalConnect')}
            </button>
            <button
              onClick={onCreateTask}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              + {t('task.newTask')}
            </button>
          </div>
        </div>

        {/* 섹션 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.title}</span>
              <span className="text-xs text-zinc-400">({section.tasks.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task 리스트 */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections
          .filter(section => section.id === activeSection)
          .map(section => (
            <div key={section.id}>
              {section.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="text-4xl mb-4">{section.icon}</span>
                  {section.external ? (
                    <>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        {t('task.externalConnectDescription', { service: section.title })}
                      </p>
                      <button
                        onClick={onConnectExternal}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        {t('task.externalConnect')}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        {t('task.internalTasksEmpty')}
                      </p>
                      <button
                        onClick={onCreateTask}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        {t('task.internalTasksEmptyDescription')}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {section.tasks.map(task => {
                    const colorClasses = getTaskColorClasses(task.color)
                    const isColorPickerOpen = colorPickerTaskId === task.id

                    return (
                    <div
                      key={task.id}
                      className={`group p-4 rounded-lg border transition-all cursor-pointer relative ${colorClasses.bgLight} ${colorClasses.border} hover:shadow-md`}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div className="flex items-start gap-3">
                        {/* 드래그 핸들 */}
                        <div
                          className="opacity-0 group-hover:opacity-100 pt-1 transition-opacity cursor-move"
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation()
                            e.dataTransfer.setData('taskId', task.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            className="w-4 h-4 text-zinc-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                          </svg>
                        </div>

                        {/* Task 내용 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground mb-1">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {task.source && task.source !== 'internal' && (
                              <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                                {task.source}
                              </span>
                            )}
                            {task.scheduledDate && (
                              <span className="text-xs text-zinc-400">
                                📅 {new Date(task.scheduledDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 색상 버튼 */}
                        {onUpdateTask && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setColorPickerTaskId(isColorPickerOpen ? null : task.id)
                              }}
                              className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${colorClasses.bg} hover:opacity-90`}
                              title="Change color"
                            >
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* 색상 픽커 */}
                            {isColorPickerOpen && (
                              <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 grid grid-cols-6 gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {TASK_COLORS.map(color => (
                                  <button
                                    key={color.name}
                                    onClick={() => handleColorChange(task.id, color.name)}
                                    className={`w-8 h-8 rounded-md ${color.bg} hover:scale-110 transition-transform ${
                                      task.color === color.name ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-zinc-600' : ''
                                    }`}
                                    title={color.label}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 큐 추가 버튼 */}
                        {onAddToQueue && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddToQueue(task.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg transition-all"
                            title={t('task.addToQueue')}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
