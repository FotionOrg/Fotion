'use client'

import { memo } from 'react'
import { TimerState, Task } from '@/types'
import { useEffect, useState, useRef } from 'react'

interface FocusModeTabProps {
  timerState: TimerState
  task: Task | null
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

// 음악 트랙 목록
const MUSIC_TRACKS = [
  { title: 'Bilateral - Stillness', path: '/music/04-Bilateral-Stillness.mp3' },
  { title: 'Bilateral - Eternal', path: '/music/05-Bilateral-Eternal.mp3' },
  { title: 'Transient', path: '/music/06-Transient.mp3' },
]

function FocusModeTab({
  timerState,
  task,
  onPause,
  onResume,
  onStop,
  onToggleFullscreen,
  isFullscreen,
}: FocusModeTabProps) {
  const [displayTime, setDisplayTime] = useState(0)

  // 음악 플레이어 상태
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)

  // 오디오 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(MUSIC_TRACKS[0].path)
      audioRef.current.volume = volume
      audioRef.current.loop = false

      // 트랙 종료 시 다음 트랙으로
      audioRef.current.addEventListener('ended', () => {
        setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // 트랙 변경 시 재생
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      audioRef.current.src = MUSIC_TRACKS[currentTrackIndex].path
      audioRef.current.volume = volume
      audioRef.current.play().catch((e) => console.error('Audio play failed:', e))
    }
  }, [currentTrackIndex])

  // 볼륨 변경
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // 타이머 업데이트
  useEffect(() => {
    if (!timerState.isRunning) {
      setDisplayTime(timerState.elapsedTime)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerState.startTime
      setDisplayTime(elapsed)
    }, 100)

    return () => clearInterval(interval)
  }, [timerState.isRunning, timerState.startTime, timerState.elapsedTime])

  // 음악 재생/일시정지
  const toggleMusic = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((e) => console.error('Audio play failed:', e))
      setIsPlaying(true)
    }
  }

  // 다음 트랙
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length)
  }

  // 이전 트랙
  const previousTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length)
  }

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
      const remaining = timerState.duration - displayTime
      return remaining > 0 ? formatTime(remaining) : '00:00'
    }
    return formatTime(displayTime)
  }

  const getProgress = () => {
    if (timerState.mode === 'timer' && timerState.duration) {
      return Math.min((displayTime / timerState.duration) * 100, 100)
    }
    return 0
  }

  return (
    <div
      className={`relative flex flex-col h-full ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={{
        background: 'linear-gradient(to bottom, #1e1b4b, #581c87, #831843)',
        backgroundSize: 'cover',
      }}
    >
      {/* 별 패턴 */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* 달 */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-100 rounded-full shadow-2xl opacity-80" />

      {/* 상단: Task 정보 */}
      <div className="relative top-12 left-0 right-0 text-center z-10">
        <h1 className="text-white text-3xl font-semibold drop-shadow-lg">
          {task?.title || '작업 중'}
        </h1>
        {task?.priority && (
          <div className="mt-2 text-white/70 text-sm">
            우선순위: {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
          </div>
        )}
      </div>

      {/* 중앙: 타이머 */}
      <div className="flex items-center justify-center flex-1 relative z-10">
        <div className="text-center">
          {/* 타이머 디스플레이 */}
          <div className="text-white text-[120px] font-mono font-bold mb-12 drop-shadow-2xl leading-none">
            {getDisplayTime()}
          </div>

          {/* 진행 바 (타이머 모드일 때만) */}
          {timerState.mode === 'timer' && (
            <div className="w-[500px] h-3 bg-white/20 rounded-full overflow-hidden mb-12 mx-auto backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* 일시정지/재생 */}
            <button
              onClick={timerState.isRunning ? onPause : onResume}
              className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg hover:scale-110"
            >
              {timerState.isRunning ? (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* 정지 */}
            <button
              onClick={onStop}
              className="w-20 h-20 bg-red-500/30 hover:bg-red-500/40 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg hover:scale-110"
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>

            {/* 전체화면 토글 */}
            <button
              onClick={onToggleFullscreen}
              className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg hover:scale-110"
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 음악 플레이어 */}
      <div className="relative bottom-16 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <div className="flex flex-col gap-3 text-white bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl">
          {/* 트랙 정보 */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white/80 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {MUSIC_TRACKS[currentTrackIndex].title}
              </div>
              <div className="text-xs text-white/60">
                Lo-fi Music {currentTrackIndex + 1} / {MUSIC_TRACKS.length}
              </div>
            </div>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center justify-center gap-4">
            {/* 이전 트랙 */}
            <button
              onClick={previousTrack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="이전 트랙"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* 재생/일시정지 */}
            <button
              onClick={toggleMusic}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110"
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* 다음 트랙 */}
            <button
              onClick={nextTrack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="다음 트랙"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* 볼륨 컨트롤 */}
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              title="볼륨"
            />
            <span className="text-xs text-white/60 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default memo(FocusModeTab)
