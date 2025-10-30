'use client'

import { useState, useEffect } from 'react'
import { AppTab, Task, TimerMode, TimerState } from '@/types'
import BrowserTabBar from '@/components/BrowserTabBar'
import VisualizationTab from '@/components/VisualizationTab'
import TasksTab from '@/components/TasksTab'
import FocusModeModal from '@/components/FocusModeModal'
import FocusModeTab from '@/components/FocusModeTab'
import CreateTaskModal from '@/components/CreateTaskModal'
import { useTasks } from '@/hooks/useTasks'
import { useFocusSessions } from '@/hooks/useFocusSessions'

// 초기 고정 탭
const initialTabs: AppTab[] = [
  {
    id: 'visualization',
    type: 'visualization',
    title: '시각화',
    isPinned: true,
  },
  {
    id: 'tasks',
    type: 'tasks',
    title: '작업 관리',
    isPinned: true,
  },
]

export default function Home() {
  const { tasks, addTask, isLoaded: tasksLoaded } = useTasks()
  const { sessions, startSession, endSession, isLoaded: sessionsLoaded } = useFocusSessions()
  const isLoaded = tasksLoaded && sessionsLoaded
  const [tabs, setTabs] = useState<AppTab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState('visualization')
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [fullscreenTabId, setFullscreenTabId] = useState<string | null>(null)

  // 활성 탭 가져오기
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // 집중 시작 핸들러
  const handleStartFocus = () => {
    setIsFocusModalOpen(true)
  }

  // 집중 모드 탭 생성
  const handleFocusStart = (taskId: string, mode: TimerMode, duration?: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // FocusSession 시작
    const session = startSession(taskId, task.title, mode, duration)

    const newTabId = `focus-${Date.now()}`
    const newTab: AppTab = {
      id: newTabId,
      type: 'focus',
      title: task.title,
      isPinned: false,
      taskId,
      timerState: {
        isRunning: true,
        mode,
        startTime: Date.now(),
        duration,
        elapsedTime: 0,
        taskId,
        sessionId: session.id, // FocusSession ID 저장
      },
    }

    setTabs([...tabs, newTab])
    setActiveTabId(newTabId)
    setIsFocusModalOpen(false)
  }

  // 작업 생성
  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(taskData)
  }

  // 탭 닫기
  const handleTabClose = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || tab.isPinned) return

    // 집중 모드 탭이고 타이머가 실행 중이면 확인
    if (tab.type === 'focus' && tab.timerState?.isRunning) {
      if (!confirm('진행 중인 타이머를 종료하시겠습니까?')) {
        return
      }
    }

    // 집중 모드 탭인 경우 FocusSession 종료
    if (tab.type === 'focus' && tab.timerState?.sessionId) {
      // 타이머가 완료된 경우인지 확인
      const isCompleted = !!(tab.timerState.mode === 'timer' &&
        tab.timerState.duration &&
        (Date.now() - tab.timerState.startTime) >= tab.timerState.duration)

      endSession(tab.timerState.sessionId, isCompleted)
    }

    // 탭 제거
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)

    // 활성 탭이 닫히는 경우 첫 번째 탭으로 이동
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0]?.id || 'visualization')
    }
  }

  // 집중 모드 탭 타이머 컨트롤
  const updateTabTimerState = (tabId: string, updater: (prev: TimerState) => TimerState) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId && tab.timerState) {
        return {
          ...tab,
          timerState: updater(tab.timerState)
        }
      }
      return tab
    }))
  }

  const handleTimerPause = (tabId: string) => {
    updateTabTimerState(tabId, prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: Date.now() - prev.startTime,
    }))
  }

  const handleTimerResume = (tabId: string) => {
    updateTabTimerState(tabId, prev => ({
      ...prev,
      isRunning: true,
      startTime: Date.now() - prev.elapsedTime,
    }))
  }

  const handleTimerStop = (tabId: string) => {
    handleTabClose(tabId)
  }

  // 전체화면 토글
  const handleToggleFullscreen = async (tabId: string) => {
    if (fullscreenTabId === tabId) {
      // 전체화면 종료
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      setFullscreenTabId(null)
    } else {
      // 전체화면 진입
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setFullscreenTabId(tabId)
      }
    }
  }

  // 전체화면 변경 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenTabId(null)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 새로고침/창 닫힘 시 타이머 확인
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 진행 중인 집중 모드 탭이 있는지 확인
      const hasRunningTimer = tabs.some(tab =>
        tab.type === 'focus' && tab.timerState?.isRunning
      )

      if (hasRunningTimer) {
        e.preventDefault()
        e.returnValue = '진행 중인 타이머가 있습니다. 페이지를 나가시겠습니까?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [tabs])

  // 타이머 업데이트 (탭 제목에 시간 표시)
  useEffect(() => {
    const interval = setInterval(() => {
      setTabs(prev => prev.map(tab => {
        if (tab.type === 'focus' && tab.timerState?.isRunning) {
          return { ...tab }
        }
        return tab
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 로딩 중일 때 표시
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* 브라우저 탭 바 (전체화면이 아닐 때만 표시) */}
      {!fullscreenTabId && (
        <BrowserTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={handleTabClose}
        />
      )}

      {/* 메인 컨텐츠 */}
      <main className={`flex-1 overflow-hidden ${fullscreenTabId ? '' : 'pt-12'}`}>
        {activeTab?.type === 'visualization' && (
          <VisualizationTab sessions={sessions} onStartFocus={handleStartFocus} />
        )}

        {activeTab?.type === 'tasks' && (
          <TasksTab tasks={tasks} onCreateTask={handleCreateTask} />
        )}

        {activeTab?.type === 'focus' && activeTab.timerState && (
          <FocusModeTab
            timerState={activeTab.timerState}
            task={tasks.find(t => t.id === activeTab.taskId) || null}
            onPause={() => handleTimerPause(activeTab.id)}
            onResume={() => handleTimerResume(activeTab.id)}
            onStop={() => handleTimerStop(activeTab.id)}
            onToggleFullscreen={() => handleToggleFullscreen(activeTab.id)}
            isFullscreen={fullscreenTabId === activeTab.id}
          />
        )}
      </main>

      {/* 집중 모드 선택 모달 */}
      <FocusModeModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        tasks={tasks}
        onStart={handleFocusStart}
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
