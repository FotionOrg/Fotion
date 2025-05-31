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
import { XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

export default function SessionJourneySection({
  selectedTask,
  setSelectedTask,
  selectedSession,
  setSelectedSession,
}: {
  selectedTask: z.infer<typeof taskSchema>
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
  selectedSession: z.infer<typeof taskSessionSchema> | null
  setSelectedSession: (session: z.infer<typeof taskSessionSchema>) => void
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
                    session={session}
                    setSelectedSession={setSelectedSession}
                    selectedSession={selectedSession}
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
          />
        </div>
      </ScrollArea>
    </div>
  )
}

function SessionCard({
  session,
  setSelectedSession,
  selectedSession,
}: {
  session: z.infer<typeof taskSessionSchema>
  setSelectedSession: (session: z.infer<typeof taskSessionSchema>) => void
  selectedSession: z.infer<typeof taskSessionSchema> | null
}) {
  const isSelected = selectedSession?.id === session.id

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
        <div className="text-xs text-gray-500 mb-1">{Math.floor(session.durationMs / (1000 * 60))} min</div>
      </CardContent>
    </Card>
  )
}

function AddNewSessionButton({
  selectedTask,
  setSelectedTask,
  setSelectedSession,
}: {
  selectedTask: z.infer<typeof taskSchema>
  setSelectedTask: (task: z.infer<typeof taskSchema>) => void
  setSelectedSession: (session: z.infer<typeof taskSessionSchema>) => void
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")

  const handleAddSession = async () => {
    if (newSessionName.trim() === "") return
    const res = await fetch("/api/task/session", {
      method: "POST",
      body: JSON.stringify({
        taskId: selectedTask.id,
        sessionName: newSessionName,
      }),
    })
    if (!res.ok) {
      toast.error("Failed to add session. Please try again.")
      return
    }
    const json = await res.json()
    const data = responseSchema.parse(json)
    setSelectedTask(data.task)
    if (data.task.sessions && data.task.sessions.length > 0) {
      setSelectedSession(data.task.sessions[data.task.sessions.length - 1])
    }
    setIsDialogOpen(false)
    setNewSessionName("")
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
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddSession}
              disabled={newSessionName.trim() === ""}
              className="text-xs"
              size="sm"
              variant="default"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
