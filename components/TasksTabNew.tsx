'use client'

import { memo, useState } from 'react'
import { Task } from '@/types'
import TaskQueue from './TaskQueue'
import TaskList from './TaskList'
import ExternalConnectModal from './ExternalConnectModal'
import TaskDetailModal from './TaskDetailModal'
import { useTaskQueue } from '@/hooks/useTaskQueue'

interface TasksTabProps {
  tasks: Task[]
  onCreateTask: () => void
}

function TasksTabNew({ tasks, onCreateTask }: TasksTabProps) {
  const { taskQueue, addToQueue, removeFromQueue } = useTaskQueue()
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

  // 작업 큐에 있는 작업들 가져오기
  const queueTasks = taskQueue
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => t !== undefined)

  return (
    <>
      <div className="h-full flex flex-col lg:flex-row">
        {/* 작업 큐 (모바일: 상단, 데스크톱: 좌측) */}
        <div className="h-1/3 lg:h-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800">
          <TaskQueue
            tasks={queueTasks}
            onRemoveFromQueue={removeFromQueue}
            onDrop={addToQueue}
          />
        </div>

        {/* 작업 목록 (모바일: 하단, 데스크톱: 우측) */}
        <div className="flex-1 h-2/3 lg:h-full overflow-hidden">
          <TaskList
            tasks={tasks}
            queuedTaskIds={taskQueue}
            onAddToQueue={addToQueue}
            onTaskClick={handleTaskClick}
            onCreateTask={onCreateTask}
            onConnectExternal={() => setIsConnectModalOpen(true)}
          />
        </div>
      </div>

      {/* 외부 연동 모달 */}
      <ExternalConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />

      {/* 작업 상세 모달 */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
      />
    </>
  )
}

export default memo(TasksTabNew)
