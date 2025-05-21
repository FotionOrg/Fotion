import { Button } from "@/components/ui/button"
import { PlayIcon, StopIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"

export default function Timer({
    audioRef,
    isTimerRunning,
    setIsTimerRunning,
    projectId,
    taskId,
  }: {
    audioRef: React.RefObject<HTMLAudioElement | null>
    isTimerRunning: boolean
    setIsTimerRunning: (isTimerRunning: boolean) => void
    projectId: string | null
    taskId: string | null
  }) {
    const recordingBufferSec = 10
    const recordingIntervalMinutes = 1
    const recordingIntervalSeconds = recordingIntervalMinutes * 60
    const recordingIntervalMS = recordingIntervalSeconds * 1000
  
    const [elapsed, setElapsed] = useState(0)
    const [duration, setDuration] = useState(15 * 60 * 1000)
    const [editing, setEditing] = useState(false)
    const [inputValue, setInputValue] = useState("15")
  
    const [recordedDurationMS, setRecordedDurationMS] = useState(0)
  
    const timerRef = useRef<NodeJS.Timeout | null>(null)
  
    const toggleTimer = () => {
      if (isTimerRunning) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        audioRef.current?.pause()
        audioRef.current!.currentTime = 0
        if (
          (elapsed - recordedDurationMS) / 1000 + recordingBufferSec >
          recordingIntervalSeconds
        ) {
          recordFocusTime()
        }
  
        setElapsed(0)
      } else {
        const start = Date.now() - elapsed
        timerRef.current = setInterval(() => {
          const newElapsed = Date.now() - start
          setElapsed(newElapsed)
  
          // 타이머 종료
          if (newElapsed >= duration) {
            clearInterval(timerRef.current!)
            setIsTimerRunning(false)
            if (
              (elapsed - recordedDurationMS) / 1000 + recordingBufferSec >
              recordingIntervalSeconds
            ) {
              recordFocusTime()
            }
            setElapsed(0)
          }
        }, 500)
        audioRef.current?.play()
      }
      setIsTimerRunning(!isTimerRunning)
    }
  
    const handleTimeClick = () => {
      if (!isTimerRunning) setEditing(true)
    }
  
    const handleInputBlur = () => {
      const minutes = Math.min(Number(inputValue), 60)
      const ms = minutes * 60 * 1000
      setDuration(ms)
      setElapsed(0)
      setEditing(false)
    }
  
    const formatTime = (ms: number) => {
      const totalSeconds = Math.max(0, Math.ceil((duration - ms) / 1000))
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
      const seconds = String(totalSeconds % 60).padStart(2, "0")
      return `${minutes}:${seconds}`
    }
  
    function recordFocusTime() {
      if (!projectId || !taskId) return
  
      fetch(`/api/notion/task/record`, {
        method: "POST",
        body: JSON.stringify({
          pageId: taskId,
          projectId: projectId,
          durationMinutes: recordingIntervalMinutes,
        }),
      }).then(async (res) => {
        const data = await res.json()
        if (data.success) {
          setRecordedDurationMS(recordedDurationMS + recordingIntervalMS)
        }
      })
    }
  
    useEffect(() => {
      if (!isTimerRunning) {
        audioRef.current?.pause()
        audioRef.current!.currentTime = 0
      }
    }, [isTimerRunning])
  
    useEffect(() => {
      let recordInterval: NodeJS.Timeout | null = null
  
      if (isTimerRunning && projectId && taskId) {
        recordInterval = setInterval(recordFocusTime, recordingIntervalMS)
      }
  
      return () => {
        if (recordInterval) {
          clearInterval(recordInterval)
        }
      }
    }, [isTimerRunning, projectId, taskId])
  
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <div className="text-5xl font-mono tabular-nums text-foreground drop-shadow-sm select-none flex items-center">
          {editing ? (
            <>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                autoFocus
                className="bg-transparent border-none text-center w-[60px] text-5xl font-mono outline-none appearance-none"
                min={1}
                max={60}
              />
              <span className="text-5xl">:00</span>
            </>
          ) : (
            <span onClick={handleTimeClick}>{formatTime(elapsed)}</span>
          )}
        </div>
  
        <Button
          onClick={toggleTimer}
          className="w-[60px] h-[60px] text-base rounded-full"
        >
          {isTimerRunning ? <StopIcon /> : <PlayIcon />}
        </Button>
      </div>
    )
  }