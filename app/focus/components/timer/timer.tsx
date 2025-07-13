import { Button } from "@/components/ui/button"
import { PlayIcon, StopIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"

export default function Timer({
  audioRef,
  isTimerRunning,
  setIsTimerRunning,
  projectId,
  taskId,
  sessionId,
  mode,
  switchingMode,
  duration,
  setDuration,
  breakDuration,
  setBreakDuration,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isTimerRunning: boolean
  setIsTimerRunning: (isTimerRunning: boolean) => void
  projectId: string | null
  taskId: string | null
  sessionId: string | null
  mode: "FOCUS" | "BREAK"
  switchingMode: () => void
  duration: number
  setDuration: (duration: number) => void
  breakDuration: number
  setBreakDuration: (breakDuration: number) => void
}) {
  const recordingBufferSec = 10
  const recordingIntervalMinutes = 0.1
  const recordingIntervalSeconds = recordingIntervalMinutes * 60
  const recordingIntervalMS = recordingIntervalSeconds * 1000
  const [elapsed, setElapsed] = useState(0)
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(duration)

  const [recordedDurationMS, setRecordedDurationMS] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const toggleTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerRef.current!)
      timerRef.current = null
      audioRef.current?.pause()
      audioRef.current!.currentTime = 0

      if (mode === "FOCUS") {
        if ((elapsed - recordedDurationMS) / 1000 + recordingBufferSec > recordingIntervalSeconds) {
          recordFocusTime()
        }
      } else {
        recordBreakTime()
      }

      setElapsed(0)
      setIsTimerRunning(false)
      switchingMode()
      return
    }

    const start = Date.now()
    timerRef.current = setInterval(() => {
      const newElapsed = Date.now() - start
      setElapsed(newElapsed)

      if (newElapsed >= duration) {
        if (mode === "FOCUS") {
          if ((elapsed - recordedDurationMS) / 1000 + recordingBufferSec > recordingIntervalSeconds) {
            recordFocusTime()
          }

          switchingMode()
          setRecordedDurationMS(recordedDurationMS + recordingIntervalMS)
          setElapsed(0)

          clearInterval(timerRef.current!)
          const newStart = Date.now()
          timerRef.current = setInterval(() => {
            const breakElapsed = Date.now() - newStart
            setElapsed(breakElapsed)
            if (breakElapsed >= breakDuration) {
              clearInterval(timerRef.current!)
              recordBreakTime()
              setIsTimerRunning(false)
              switchingMode()
              setElapsed(0)
            }
          }, 500)
        } else {
          clearInterval(timerRef.current!)
          recordBreakTime()
          setIsTimerRunning(false)
          switchingMode()
          setElapsed(0)
        }
      }
    }, 500)

    audioRef.current?.play()
    setIsTimerRunning(true)
  }
  const handleTimeClick = () => {
    if (!isTimerRunning) setEditing(true)
  }

  const handleInputBlur = () => {
    const minutes = Math.min(Number(inputValue), 60)
    const ms = minutes * 60 * 1000
    if (mode === "FOCUS") {
      setDuration(ms)
    } else {
      setBreakDuration(ms)
    }
    setElapsed(0)
    setEditing(false)
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.ceil((mode === "FOCUS" ? duration - ms : breakDuration - ms) / 1000))
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    return `${minutes}:${seconds}`
  }

  function recordFocusTime() {
    if (!projectId || !taskId) return

    fetch(`/api/task/session/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: projectId,
        taskId: taskId,
        sessionId: sessionId,
        type: "FOCUS",
        durationMinutes: recordingIntervalMinutes,
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (data.success) {
          setRecordedDurationMS(recordedDurationMS + recordingIntervalMinutes)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  function recordBreakTime() {
    if (!projectId || !taskId) return
    fetch(`/api/task/session/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: projectId,
        taskId: taskId,
        sessionId: sessionId,
        type: "BREAK",
        breakDurationMinutes: recordingIntervalMinutes,
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (data.success) {
        }
      })
      .catch((err) => console.error(err))
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
      if (mode === "FOCUS") {
        recordInterval = setInterval(recordFocusTime, recordingIntervalMS)
      } else {
        recordInterval = setInterval(() => {
          recordBreakTime()
        }, recordingIntervalMS)
      }
    }

    return () => {
      if (recordInterval) {
        clearInterval(recordInterval)
      }
    }
  }, [isTimerRunning, projectId, taskId, mode])

  useEffect(() => {
    if (isTimerRunning) {
      toggleTimer()
    }
  }, [sessionId])

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="text-5xl font-mono tabular-nums text-foreground drop-shadow-sm select-none flex items-center">
        <span className="mr-2 text-sm">{mode === "FOCUS" ? "Focus" : "Break"}</span>
        {editing ? (
          <>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={(e) => setInputValue(parseInt(e.target.value))}
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

      <Button onClick={toggleTimer} className="w-[60px] h-[60px] text-base rounded-full" disabled={!sessionId}>
        {isTimerRunning ? <StopIcon /> : <PlayIcon />}
      </Button>
    </div>
  )
}
