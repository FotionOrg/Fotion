'use client'

import { useState } from 'react'
import { AppTab, Task, TimerState, TimerMode } from '@/types'
import BottomTabBar from '@/components/BottomTabBar'
import BackgroundTimerBar from '@/components/BackgroundTimerBar'
import VisualizationTab from '@/components/VisualizationTab'
import TasksTab from '@/components/TasksTab'
import FocusModeModal from '@/components/FocusModeModal'
import FocusMode from '@/components/FocusMode'
import CreateTaskModal from '@/components/CreateTaskModal'
import { mockTasks } from '@/lib/mockData'

export default function Home() {
  const [currentTab, setCurrentTab] = useState<AppTab>('visualization')

  // 모킹 데이터 사용 (향후 API 호출로 대체)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    mode: 'timer',
    startTime: 0,
    elapsedTime: 0,
  })

  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  const handleStartFocus = () => {
    setIsFocusModalOpen(true)
  }

  const handleFocusStart = (taskId: string, mode: TimerMode, duration?: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setCurrentTask(task)
    setTimerState({
      isRunning: true,
      mode,
      startTime: Date.now(),
      duration,
      elapsedTime: 0,
      taskId,
    })
    setIsFocusMode(true)
    setIsFocusModalOpen(false)
  }

  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks([...tasks, newTask])
  }

  const handleTimerPause = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: Date.now() - prev.startTime,
    }))
  }

  const handleTimerResume = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: Date.now() - prev.elapsedTime,
    }))
  }

  const handleTimerStop = () => {
    setTimerState({
      isRunning: false,
      mode: 'timer',
      startTime: 0,
      elapsedTime: 0,
    })
    setIsFocusMode(false)
    setCurrentTask(null)
  }

  const handleReturnToFocus = () => {
    setIsFocusMode(true)
  }

  const handleChangeTask = () => {
    setIsFocusMode(false)
    setIsFocusModalOpen(true)
  }

  // 타이머가 실행 중이고 집중 모드가 아닐 때만 백그라운드 바 표시
  const showTimerBar = (timerState.isRunning || timerState.elapsedTime > 0) && !isFocusMode

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* 백그라운드 타이머 바 */}
      {showTimerBar && (
        <BackgroundTimerBar
          timerState={timerState}
          onPause={handleTimerPause}
          onResume={handleTimerResume}
          onStop={handleTimerStop}
          onReturnToFocus={handleReturnToFocus}
          taskTitle={currentTask?.title || '작업 중'}
        />
      )}

      {/* 메인 컨텐츠 */}
      <main className={`flex-1 overflow-hidden ${showTimerBar ? 'pt-12' : ''}`}>
        {currentTab === 'visualization' && (
          <VisualizationTab tasks={tasks} onStartFocus={handleStartFocus} />
        )}
        {currentTab === 'tasks' && (
          <TasksTab tasks={tasks} onCreateTask={handleCreateTask} />
        )}
      </main>

      {/* 하단 탭 바 */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isVisible={!isFocusMode}
      />

      {/* 집중 모드 선택 모달 */}
      <FocusModeModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        tasks={tasks}
        onStart={handleFocusStart}
      />

      {/* 집중 모드 전체화면 */}
      <FocusMode
        isActive={isFocusMode}
        timerState={timerState}
        task={currentTask}
        onPause={handleTimerPause}
        onResume={handleTimerResume}
        onStop={handleTimerStop}
        onChangeTask={handleChangeTask}
      />

      {/* 작업 생성 모달 */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreate={handleTaskCreate}
      />
    </div>
  )
}
