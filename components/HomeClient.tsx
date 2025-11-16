'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AppTab, Task, TimerMode, TimerState } from '@/types'
import Sidebar from '@/components/Sidebar'
import BrowserTabBar from '@/components/BrowserTabBar'
import VisualizationTab from '@/components/VisualizationTab'
import TasksTabNew from '@/components/TasksTabNew'
import FocusModeTab from '@/components/FocusModeTab'
import { useTasks } from '@/hooks/useTasks'
import { useFocusSessions } from '@/hooks/useFocusSessions'
import { useTaskQueue } from '@/hooks/useTaskQueue'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import { useKeyboardShortcuts, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'
import { useElectronShortcuts } from '@/hooks/useElectronShortcuts'
import { useTranslations } from 'next-intl'

// 동적 임포트 - 모달 컴포넌트들 (초기 로딩 시 불필요)
const StatisticsTab = dynamic(() => import('@/components/StatisticsTab'), { ssr: false })
const SettingsTab = dynamic(() => import('@/components/SettingsTab'), { ssr: false })
const FocusModeModal = dynamic(() => import('@/components/FocusModeModal'), { ssr: false })
const CreateTaskModal = dynamic(() => import('@/components/CreateTaskModal'), { ssr: false })
const KeyboardShortcutsModal = dynamic(() => import('@/components/KeyboardShortcutsModal'), { ssr: false })
const ConfirmModal = dynamic(() => import('@/components/ConfirmModal'), { ssr: false })

// 초기 탭 없음 (사이드바에서 선택하여 열기)
const initialTabs: AppTab[] = []

export default function HomeClient() {
  const t = useTranslations()
  const { tasks, addTask, updateTask, isLoaded: tasksLoaded } = useTasks()
  const { sessions, startSession, endSession, isLoaded: sessionsLoaded } = useFocusSessions()
  const { taskQueue, addToQueue, removeFromQueue, isLoaded: queueLoaded } = useTaskQueue()
  const { settings, updateSettings, isLoaded: settingsLoaded } = useSettings()
  const isLoaded = tasksLoaded && sessionsLoaded && queueLoaded && settingsLoaded

  // 테마 적용
  useTheme(settings.theme)

  // 전역 오디오 객체 (모든 Focus Mode 탭에서 공유)
  const globalAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isGlobalMusicPlaying, setIsGlobalMusicPlaying] = useState(false)
  const [tabs, setTabs] = useState<AppTab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [fullscreenTabId, setFullscreenTabId] = useState<string | null>(null)

  // Confirm 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // 활성 탭 가져오기
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Visualization/Task관리/Statistics/Settings 탭 열기
  const handleOpenTab = (tabType: 'visualization' | 'tasks' | 'statistics' | 'settings') => {
    // 이미 열려있는지 확인
    const existingTab = tabs.find(t => t.type === tabType)

    if (existingTab) {
      // 이미 열려있으면 활성화만
      setActiveTabId(existingTab.id)
    } else {
      // 새로 열기
      const tabTitles = {
        visualization: t('nav.visualization'),
        tasks: t('nav.tasks'),
        statistics: t('nav.statistics'),
        settings: t('nav.settings'),
      }
      const newTab: AppTab = {
        id: tabType,
        type: tabType,
        title: tabTitles[tabType],
        isPinned: false,
      }
      setTabs([...tabs, newTab])
      setActiveTabId(newTab.id)
    }
  }

  // Start Focus 핸들러
  const handleStartFocus = () => {
    setIsFocusModalOpen(true)
  }

  // Focus Mode 탭 생성
  const handleFocusStart = async (taskId: string, mode: TimerMode, duration?: number, providedTask?: Task) => {
    // providedTask가 있으면 사용 (Quick Start), 없으면 tasks에서 검색
    const task = providedTask || tasks.find(t => t.id === taskId)
    if (!task) {
      console.error('[HomeClient] Task not found:', taskId)
      return
    }

    console.log('[HomeClient] Starting focus with task:', task)

    // FocusSession Start
    const session = await startSession(taskId, task.title, mode, duration)

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
        sessionId: session.id, // FocusSession ID Save
      },
    }

    setTabs([...tabs, newTab])
    setActiveTabId(newTabId)
    setIsFocusModalOpen(false)

    // 첫 집중 세션일 때만 음악 시작 (사용자 상호작용 컨텍스트 내에서 실행)
    if (!isGlobalMusicPlaying && typeof window !== 'undefined') {
      // 전역 오디오 객체가 없으면 생성
      if (!globalAudioRef.current) {
        globalAudioRef.current = new Audio('/music/04-Bilateral-Stillness.mp3')
        globalAudioRef.current.volume = 0.5
        globalAudioRef.current.loop = false
      }

      // 사용자 상호작용 내에서 음악 시작
      globalAudioRef.current.play()
        .then(() => {
          setIsGlobalMusicPlaying(true)
        })
        .catch((e) => {
          console.warn('Music auto-play failed:', e)
        })
    }
  }

  // Task 생성
  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleTaskCreate = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await addTask(taskData)
  }

  // 탭 닫기
  const handleTabClose = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    // 탭 닫기 실행
    const closeTab = () => {
      // Focus Mode 탭인 경우 FocusSession End
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

      // 모든 Focus 세션 탭이 닫혔는지 확인
      const hasFocusTabs = newTabs.some(t => t.type === 'focus')
      if (!hasFocusTabs && globalAudioRef.current) {
        // 모든 Focus 세션이 End되면 음악 Stop
        globalAudioRef.current.pause()
        globalAudioRef.current.currentTime = 0
        setIsGlobalMusicPlaying(false)
      }

      // 활성 탭이 닫히는 경우 첫 번째 탭으로 이동 (없으면 null)
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0]?.id || null)
      }
    }

    // Focus Mode 탭이고 타이머가 실행 중이면 확인 모달
    if (tab.type === 'focus' && tab.timerState?.isRunning) {
      setConfirmModal({
        isOpen: true,
        title: t('focus.endTimer'),
        message: t('focus.endTimerMessage'),
        onConfirm: () => {
          closeTab()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        },
        variant: 'warning',
      })
    } else {
      // 바로 닫기
      closeTab()
    }
  }

  // Focus Mode 탭 타이머 컨트롤
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
      // 전체화면 End
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

  // 현재 활성 Focus 탭 종료 (글로벌 단축키용)
  const handleEndCurrentSession = () => {
    const currentTab = tabs.find(tab => tab.id === activeTabId)
    if (currentTab && currentTab.type === 'focus') {
      handleTabClose(currentTab.id)
    }
  }

  // Electron 글로벌 단축키 등록
  useElectronShortcuts({
    onStartFocus: handleStartFocus,
    onEndSession: handleEndCurrentSession,
  })

  // 새로고침/창 닫힘 시 타이머 확인
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 진행 중인 Focus Mode 탭이 있는지 확인
      const hasRunningTimer = tabs.some(tab =>
        tab.type === 'focus' && tab.timerState?.isRunning
      )

      if (hasRunningTimer) {
        e.preventDefault()
        e.returnValue = t('focus.beUnloadWarning')
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [tabs])

  // 타이머 업데이트 (탭 Title에 Time 표시)
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

  // 키보드 단축키 정의
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shortcuts = useMemo<KeyboardShortcut[]>(() => [
    // 일반
    {
      key: '?',
      shift: true,
      description: '단축키 도움말 보기',
      category: '일반',
      action: () => setIsShortcutsModalOpen(true),
    },
    // 탭 전환
    {
      key: '1',
      ctrl: true,
      description: 'Visualization 탭 열기/이동',
      category: '탭 이동',
      action: () => handleOpenTab('visualization'),
    },
    {
      key: '2',
      ctrl: true,
      description: 'Tasks 탭 열기/이동',
      category: '탭 이동',
      action: () => handleOpenTab('tasks'),
    },
    {
      key: '3',
      ctrl: true,
      description: 'Statistics 탭 열기/이동',
      category: '탭 이동',
      action: () => handleOpenTab('statistics'),
    },
    {
      key: ',',
      ctrl: true,
      description: 'Settings 탭 열기/이동',
      category: '탭 이동',
      action: () => handleOpenTab('settings'),
    },
    {
      key: '[',
      ctrl: true,
      description: '이전 탭',
      category: '탭 이동',
      action: () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        setActiveTabId(tabs[prevIndex].id)
      },
    },
    {
      key: ']',
      ctrl: true,
      description: '다음 탭',
      category: '탭 이동',
      action: () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        setActiveTabId(tabs[nextIndex].id)
      },
    },
    {
      key: 'w',
      ctrl: true,
      description: '현재 탭 닫기',
      category: '탭 이동',
      action: () => {
        if (activeTabId) {
          handleTabClose(activeTabId)
        }
      },
    },
    // Tasks
    {
      key: 'n',
      ctrl: true,
      description: 'Create New Task',
      category: 'Tasks',
      action: () => setIsCreateTaskModalOpen(true),
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Focus Mode Start',
      category: 'Focus Mode',
      action: () => setIsFocusModalOpen(true),
    },
    {
      key: 'Escape',
      description: '모달 닫기 / 전체화면 End',
      category: '일반',
      action: () => {
        if (fullscreenTabId) {
          handleToggleFullscreen(fullscreenTabId)
        } else if (isFocusModalOpen) {
          setIsFocusModalOpen(false)
        } else if (isCreateTaskModalOpen) {
          setIsCreateTaskModalOpen(false)
        } else if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false)
        }
      },
    },
  ], [tabs, activeTabId, activeTab, fullscreenTabId, isFocusModalOpen, isCreateTaskModalOpen, isShortcutsModalOpen])

  // 키보드 단축키 등록
  useKeyboardShortcuts(shortcuts)

  // 로딩 중일 때 표시
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-zinc-600 dark:text-zinc-400">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="electron-main-container flex h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* 좌측 사이드바 (전체화면이 아닐 때만 표시) */}
      {!fullscreenTabId && (
        <Sidebar
          tabs={tabs}
          activeTabId={activeTabId}
          onOpenTab={handleOpenTab}
          onTabChange={setActiveTabId}
          onShowShortcuts={() => setIsShortcutsModalOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바 (전체화면이 아닐 때만 표시) */}
        {!fullscreenTabId && (
          <div className="flex items-center bg-surface-secondary dark:bg-surface border-b border-border">
            {/* 모바일 햄버거 메뉴 */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={t('nav.openMenu')}
            >
              <svg
                className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* 탭 바 (탭이 있을 때만) */}
            {tabs.length > 0 && (
              <BrowserTabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onTabChange={setActiveTabId}
                onTabClose={handleTabClose}
              />
            )}
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-hidden">
          {!activeTab && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-zinc-500 dark:text-zinc-400">
                <p className="text-lg mb-2">{t('sidebar.selectFromMenu')}</p>
                <p className="text-sm">
                  {t('sidebar.orPress')} <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">Ctrl + 1</kbd> / <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">Ctrl + 2</kbd>
                </p>
              </div>
            </div>
          )}

          {activeTab?.type === 'visualization' && (
            <VisualizationTab sessions={sessions} tasks={tasks} onStartFocus={handleStartFocus} />
          )}

          {activeTab?.type === 'tasks' && (
            <TasksTabNew
              tasks={tasks}
              taskQueue={taskQueue}
              onAddToQueue={addToQueue}
              onRemoveFromQueue={removeFromQueue}
              onCreateTask={handleCreateTask}
              onUpdateTask={updateTask}
            />
          )}

          {activeTab?.type === 'statistics' && (
            <StatisticsTab sessions={sessions} />
          )}

          {activeTab?.type === 'settings' && (
            <SettingsTab settings={settings} onUpdateSettings={updateSettings} />
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
              globalAudioRef={globalAudioRef}
              isGlobalMusicPlaying={isGlobalMusicPlaying}
              onMusicPlayingChange={setIsGlobalMusicPlaying}
            />
          )}
        </main>
      </div>

      {/* Focus Mode 선택 모달 */}
      <FocusModeModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        tasks={tasks}
        queuedTaskIds={taskQueue}
        defaultTimerDuration={settings.defaultTimerDuration}
        onStart={handleFocusStart}
        onOpenTasksTab={() => handleOpenTab('tasks')}
        onOpenSettingsTab={() => handleOpenTab('settings')}
        onCreateTask={handleTaskCreate}
      />

      {/* Task 생성 모달 */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreate={handleTaskCreate}
      />

      {/* 키보드 단축키 도움말 모달 */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={shortcuts}
      />

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        variant={confirmModal.variant}
      />
    </div>
  )
}
