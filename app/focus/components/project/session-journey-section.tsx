import { responseSchema } from "@/app/api/task/session/type"
import { taskSchema, taskSessionSchema } from "@/app/api/task/type"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { Loader2, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

export default function SessionJourneySection({
  selectedTask,
  setSelectedTask,
  selectedSession,
  setSelectedSession,
  isTimerRunning,
}: {
  selectedTask: z.infer<typeof taskSchema>
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
  selectedSession: z.infer<typeof taskSessionSchema> | null
  setSelectedSession: (session: z.infer<typeof taskSessionSchema>) => void
  isTimerRunning: boolean
}) {
  useEffect(() => {
    if (!selectedSession && selectedTask.sessions && selectedTask.sessions.length > 0) {
      setSelectedSession(selectedTask.sessions[selectedTask.sessions.length - 1])
    }
  }, [selectedTask, selectedSession])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTask(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [setSelectedTask])

  const { data: durationMSPerSession } = useQuery({
    queryKey: ["task", selectedTask.id],
    queryFn: async () =>
      fetch(`/api/task?taskId=${selectedTask.id}`).then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch task")
        }
        const json = await res.json()
        const task = taskSchema.parse(json)
        const durationMSPerSession: Record<string, { durationMs: { type: string; duration: number }[] }> = {}
        for (const session of task.sessions || []) {
          durationMSPerSession[session.id] = {
            durationMs: session.duration || [],
          }
        }
        setSelectedTask(task)
        return durationMSPerSession
      }),
    refetchInterval: 5_000,
  })

  return (
    <div className="flex flex-col justify-center items-center w-full max-h-screen min-h-screen">
      <div className="flex flex-row items-center gap-2 w-full justify-center mb-5">
        <XIcon className="size-4 cursor-pointer" onClick={() => setSelectedTask(null)} />
      </div>
      <ScrollArea className="flex flex-col items-center justify-center w-[80%] max-h-[70%]">
        <div className="flex flex-col items-center w-full mb-4 mt-2">
          {selectedTask.sessions &&
            selectedTask.sessions
              .sort((a, b) => a.order - b.order)
              .map((session, idx, arr) => (
                <div key={session.id} className="flex flex-col items-center w-[90%]">
                  <SessionCard
                    selectedTask={selectedTask.duration}
                    session={session}
                    setSelectedSession={setSelectedSession}
                    selectedSession={selectedSession}
                    durationMS={durationMSPerSession?.[session.id]?.durationMs}
                  />
                  {idx < arr.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-black" />
                    </div>
                  )}
                </div>
              ))}
        </div>
        <div className="flex flex-row items-center gap-2 w-full justify-center">
          <AddNewSessionButton
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            setSelectedSession={setSelectedSession}
            isTimerRunning={isTimerRunning}
          />
        </div>
      </ScrollArea>
    </div>
  )
}

function SessionCard({
  session,
  selectedTask,
  setSelectedSession,
  selectedSession,
  durationMS,
}: {
  session: z.infer<typeof taskSessionSchema>
  selectedTask: { type: string; duration: number }[] | null
  setSelectedSession: (session: z.infer<typeof taskSessionSchema>) => void
  selectedSession: z.infer<typeof taskSessionSchema> | null
  durationMS?: { type: string; duration: number }[] | null
}) {
  const isSelected = selectedSession?.id === session.id
  const duration = (durationMS || session.duration).find((d) => d.type === "FOCUS")?.duration || 0
  const task = selectedTask?.find((d) => d.type === "BREAK")?.duration || 0

  return (
    <Card
      className={`w-full transition-all cursor-pointer border-2 ${
        isSelected ? "border-green-500 bg-green-50 shadow-lg scale-[1.03]" : "border-gray-200 bg-white"
      }`}
      onClick={() => setSelectedSession(session)}
    >
      <CardHeader className="p-3">
        <CardTitle className={`text-sm ${isSelected ? "text-green-700" : ""}`}>{session.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="text-xs text-gray-500 mb-1">
          <span>
            Focus:&nbsp;
            {(() => {
              //const totalSeconds = Math.floor((duration.find((d) => d.type === "FOCUS")?.duration) / 1000)
              const totalSeconds = Math.floor(duration / 1000)
              const hours = Math.floor(totalSeconds / 3600)
              const minutes = Math.floor((totalSeconds % 3600) / 60)
              const seconds = totalSeconds % 60
              return [hours > 0 ? `${hours}h` : null, minutes > 0 ? `${minutes}m` : null, `${seconds}s`]
                .filter(Boolean)
                .join(" ")
            })()}
          </span>
        </div>
        <div className="text-xs text-gray-500 mb-1">
          <span>
            Break:&nbsp;
            {(() => {
              const totalSeconds = Math.floor(task / 1000)
              const hours = Math.floor(totalSeconds / 3600)
              const minutes = Math.floor((totalSeconds % 3600) / 60)
              const seconds = totalSeconds % 60
              return [hours > 0 ? `${hours}h` : null, minutes > 0 ? `${minutes}m` : null, `${seconds}s`]
                .filter(Boolean)
                .join(" ")
            })()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function AddNewSessionButton({
  selectedTask,
  setSelectedTask,
  setSelectedSession,
  isTimerRunning,
}: {
  selectedTask: z.infer<typeof taskSchema>
  setSelectedTask: (task: z.infer<typeof taskSchema>) => void
  setSelectedSession: (session: z.infer<typeof taskSessionSchema>) => void
  isTimerRunning: boolean
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddSession = async () => {
    setIsLoading(true)
    if (newSessionName.trim() === "") return
    const res = await fetch("/api/task/session", {
      method: "POST",
      body: JSON.stringify({
        taskId: selectedTask.id,
        sessionName: newSessionName,
        duration: [
          {
            type: "FOCUS",
            duration: 0,
          },
        ],
      }),
    })
    if (!res.ok) {
      toast.error("Failed to add session. Please try again.")
      return
    }
    const json = await res.json()
    const data = responseSchema.parse(json)
    setSelectedTask(data.task)
    if (data.task.sessions && data.task.sessions.length > 0 && isTimerRunning) {
      setSelectedSession(data.task.sessions[data.task.sessions.length - 1])
    }
    setIsDialogOpen(false)
    setNewSessionName("")
    setIsLoading(false)
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            Add Session
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Session</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="New session name"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddSession()
              }
            }}
            disabled={isLoading}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNewSessionName("")
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddSession}
              disabled={newSessionName.trim() === "" || isLoading}
              className="text-xs"
              size="sm"
              variant="default"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
