'use client'

import { TimerState } from '@/types'
import { useEffect, useState } from 'react'

interface BackgroundTimerBarProps {
  timerState: TimerState
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onReturnToFocus: () => void
  taskTitle?: string
}

export default function BackgroundTimerBar({
  timerState,
  onPause,
  onResume,
  onStop,
  onReturnToFocus,
  taskTitle = 'Task 중'
}: BackgroundTimerBarProps) {
  const [displayTime, setDisplayTime] = useState(timerState.elapsedTime)

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

  if (!timerState.isRunning && timerState.elapsedTime === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 dark:bg-blue-500 text-white shadow-md z-40 safe-area-inset-top">
      <div className="flex items-center justify-between h-12 max-w-screen-xl mx-auto px-4">
        {/* 좌측: Task 정보 */}
        <button
          onClick={onReturnToFocus}
          className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium truncate">{taskTitle}</span>
        </button>

        {/* 중앙: 타이머 */}
        <div className="text-lg font-mono font-semibold px-4">
          {getDisplayTime()}
        </div>

        {/* 우측: 컨트롤 */}
        <div className="flex items-center gap-2">
          <button
            onClick={timerState.isRunning ? onPause : onResume}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title={timerState.isRunning ? '일시Stop' : 'Play'}
          >
            {timerState.isRunning ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={onStop}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Stop"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
