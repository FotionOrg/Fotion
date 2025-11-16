'use client'

import { memo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Task } from '@/types'
import TaskQueue from './TaskQueue'
import TaskList from './TaskList'

// 동적 임포트 - 모달들 (버튼 클릭/태스크 클릭 시에만 필요)
const ExternalConnectModal = dynamic(() => import('./ExternalConnectModal'), { ssr: false })
const TaskDetailModal = dynamic(() => import('./TaskDetailModal'), { ssr: false })

interface TasksTabProps {
  tasks: Task[]
  taskQueue: string[]
  onAddToQueue: (taskId: string) => void
  onRemoveFromQueue: (taskId: string) => void
  onCreateTask: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

function TasksTabNew({ tasks, taskQueue, onAddToQueue, onRemoveFromQueue, onCreateTask, onUpdateTask }: TasksTabProps) {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  // 외부 서비스 연동
  const handleConnect = (services: string[]) => {
    console.log('연동할 서비스:', services)
    // TODO: 실제 연동 로직 구현
  }

  // Task Queue에 있는 Task들 가져오기
  const queueTasks = taskQueue
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => t !== undefined)

  return (
    <>
      <div className="h-full flex flex-col lg:flex-row">
        {/* Task Queue (모바일: 상단, 데스크톱: 좌측) */}
        <div className="h-1/3 lg:h-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border">
          <TaskQueue
            tasks={queueTasks}
            onRemoveFromQueue={onRemoveFromQueue}
            onDrop={onAddToQueue}
          />
        </div>

        {/* Task List (모바일: 하단, 데스크톱: 우측) */}
        <div className="flex-1 h-2/3 lg:h-full overflow-hidden">
          <TaskList
            tasks={tasks}
            queuedTaskIds={taskQueue}
            onAddToQueue={onAddToQueue}
            onTaskClick={handleTaskClick}
            onCreateTask={onCreateTask}
            onConnectExternal={() => setIsConnectModalOpen(true)}
            onUpdateTask={onUpdateTask}
          />
        </div>
      </div>

      {/* 외부 연동 모달 */}
      <ExternalConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />

      {/* Task 상세 모달 */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
      />
    </>
  )
}

export default memo(TasksTabNew)
