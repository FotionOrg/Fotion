'use client'

import { TimerState, Task } from '@/types'
import { useEffect, useState, useRef } from 'react'

interface FocusModeProps {
  isActive: boolean
  timerState: TimerState
  task: Task | null
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onChangeTask: () => void
}

export default function FocusMode({
  isActive,
  timerState,
  task,
  onPause,
  onResume,
  onStop,
  onChangeTask,
}: FocusModeProps) {
  const [displayTime, setDisplayTime] = useState(timerState.elapsedTime)
  const [, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      setIsFullscreen(false)
    } catch (err) {
      console.error('Exit fullscreen failed:', err)
    }
  }

  // 타이머 업데이트
  useEffect(() => {
    if (!timerState.isRunning) {
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerState.startTime
      setDisplayTime(elapsed)
    }, 100)

    return () => clearInterval(interval)
  }, [timerState.isRunning, timerState.startTime])

  // 타이머가 멈췄을 때 displayTime을 timerState.elapsedTime으로 동기화
  const currentDisplayTime = timerState.isRunning ? displayTime : timerState.elapsedTime

  // 전체화면 진입/End
  useEffect(() => {
    if (!isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void exitFullscreen()
      return
    }

    const enterFullscreen = async () => {
      try {
        if (containerRef.current && document.fullscreenEnabled) {
          await containerRef.current.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (err) {
        console.error('Fullscreen failed:', err)
      }
    }

    void enterFullscreen()

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement && isActive) {
        // 사용자가 ESC로 전체화면 End 시
        onStop()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isActive, onStop])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getDisplayTime = () => {
    if (timerState.mode === 'timer' && timerState.duration) {
      const remaining = timerState.duration - currentDisplayTime
      return remaining > 0 ? formatTime(remaining) : '00:00'
    }
    return formatTime(currentDisplayTime)
  }

  const getProgress = () => {
    if (timerState.mode === 'timer' && timerState.duration) {
      return Math.min((currentDisplayTime / timerState.duration) * 100, 100)
    }
    return 0
  }

  const handleExitClick = () => {
    onStop()
    exitFullscreen()
  }

  if (!isActive) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'stars\' x=\'0\' y=\'0\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'10\' cy=\'20\' r=\'1\' fill=\'white\' opacity=\'0.3\'/%3E%3Ccircle cx=\'60\' cy=\'40\' r=\'1.5\' fill=\'white\' opacity=\'0.4\'/%3E%3Ccircle cx=\'30\' cy=\'70\' r=\'1\' fill=\'white\' opacity=\'0.2\'/%3E%3Ccircle cx=\'80\' cy=\'10\' r=\'1\' fill=\'white\' opacity=\'0.5\'/%3E%3Ccircle cx=\'50\' cy=\'90\' r=\'1.5\' fill=\'white\' opacity=\'0.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23stars)\'/%3E%3C/svg%3E")',
      }}
    >
      {/* 달 */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-100 rounded-full shadow-2xl opacity-80" />

      {/* 상단: Task 정보 */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h1 className="text-white text-2xl font-medium opacity-90">
          {task?.title || 'Task 중'}
        </h1>
      </div>

      {/* 중앙: 타이머 */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-white text-8xl font-mono font-bold mb-8">
            {getDisplayTime()}
          </div>

          {timerState.mode === 'timer' && (
            <div className="w-96 h-2 bg-white/20 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            {/* 일시Stop/Play */}
            <button
              onClick={timerState.isRunning ? onPause : onResume}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              {timerState.isRunning ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Stop */}
            <button
              onClick={handleExitClick}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 하단: 컨트롤 */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={onChangeTask}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors backdrop-blur-sm"
        >
          다른 Task으로 전환
        </button>

        <button
          onClick={handleExitClick}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors backdrop-blur-sm"
        >
          전체화면 End
        </button>
      </div>

      {/* 음악 플레이어 (향후 구현) */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
        <div className="text-white/50 text-sm">
          🎵 Lo-fi 음악 (향후 구현)
        </div>
      </div>
    </div>
  )
}
