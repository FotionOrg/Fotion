"use client"

import { taskSchema, taskSessionSchema } from "@/app/api/task/type"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Volume2Icon, VolumeOffIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { projectSchema } from "../../type"
import Timer from "./timer"

export default function TimerSection({
  selectedProject,
  selectedTask,
  selectedSession,
}: {
  selectedProject: z.infer<typeof projectSchema> | null
  selectedTask: z.infer<typeof taskSchema> | null
  selectedSession: z.infer<typeof taskSessionSchema> | null
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioAlarmRef = useRef<HTMLAudioElement | null>(null)
  const [volume, setVolume] = useState(0.5)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
    if (audioAlarmRef.current) {
      audioAlarmRef.current.volume = volume
    }
  }, [volume, audioRef])

  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [mode, setMode] = useState<"FOCUS" | "BREAK">("FOCUS")

  const handlingSwitchingMode = () => {
    setMode((prev) => {
      audioAlarmRef.current?.play()
      if (prev === "FOCUS") {
        return "BREAK"
      } else {
        return "FOCUS"
      }
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 w-full">
      <Card className="w-full aspect-square shadow-2xl flex items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center gap-6 p-8 h-full relative">
          <div className="flex flex-col items-center gap-6">
            <Timer
              audioRef={audioRef}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
              projectId={selectedProject?.id ?? null}
              taskId={selectedTask?.id ?? null}
              sessionId={selectedSession?.id ?? null}
              mode={mode}
              switchingMode={handlingSwitchingMode}
            />

            {isTimerRunning && (
              <div className="flex items-center gap-2 w-full">
                {volume > 0 ? (
                  <Volume2Icon
                    className="size-4 hover:cursor-pointer"
                    onClick={() => {
                      setVolume(0)
                    }}
                  />
                ) : (
                  <VolumeOffIcon
                    className="size-4 hover:cursor-pointer"
                    onClick={() => {
                      setVolume(0.5)
                    }}
                  />
                )}
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[volume]}
                  onValueChange={([v]: number[]) => {
                    setVolume(v)
                  }}
                  className="w-full"
                />
              </div>
            )}

            <audio
              ref={audioRef}
              src="https://mfrc3lvbxokueaya.public.blob.vercel-storage.com/lofi-background-music-337568-aIPJNMILf7xBoX7lmh9UzpJYlzv4aV.mp3"
              loop
            />
            <audio ref={audioAlarmRef} src="https://t1.daumcdn.net/cfile/tistory/995003385D2A04E214" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
