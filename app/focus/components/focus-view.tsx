"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { z } from "zod"
import {
  databasePageSchema
} from "../../api/notion/search/database/page/[projectId]/type"
import { projectSchema } from "../type"
import LinearTaskSelect from "./linear/section-linear-task-select"
import NotionTaskSelect from "./notion/section-notion-task-select"
import CreateNewProject from "./section-create-new-project"
import Timer from "./section-timer"
import ProjectSelect from "./select-project"

export default function FocusView({
  projects,
  notionIntegrationId,
  linearIntegrationId,
  userId,
}: {
  projects: z.infer<typeof projectSchema>[]
  notionIntegrationId: string | null
  linearIntegrationId: string | null
  userId: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<z.infer<
    typeof projectSchema
  > | null>(null)

  const [selectedTask, setSelectedTask] = useState<z.infer<
    typeof databasePageSchema
  > | null>(null)

  const [isTimerRunning, setIsTimerRunning] = useState(false)

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-[400px] h-[400px] shadow-2xl flex items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center gap-6 p-8 h-full relative">
          <div className="flex flex-col items-center gap-6">
            <Timer
              audioRef={audioRef}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
              projectId={selectedProject?.id ?? null}
              taskId={selectedTask?.id ?? null}
            />
            {!selectedProject && (
              <ProjectSelect
                setIsDialogOpen={setIsDialogOpen}
                projects={projects}
                setSelectedProject={setSelectedProject}
              />
            )}

            {selectedProject && selectedProject.sourceType === "NOTION" && (
              <NotionTaskSelect
                projectId={selectedProject.id}
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
              />
            )}

            {selectedProject && selectedProject.sourceType === "LINEAR" && (
              <LinearTaskSelect
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
              />
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Add a new project to your account.
                </DialogDescription>

                <CreateNewProject
                  setIsDialogOpen={setIsDialogOpen}
                  notionIntegrationId={notionIntegrationId}
                  linearIntegrationId={linearIntegrationId}
                  userId={userId}
                  projects={projects}
                />
              </DialogContent>
            </Dialog>

            <audio
              ref={audioRef}
              src="https://mfrc3lvbxokueaya.public.blob.vercel-storage.com/lofi-background-music-337568-aIPJNMILf7xBoX7lmh9UzpJYlzv4aV.mp3"
              loop
            />
          </div>

          {(selectedTask !== null || selectedProject !== null) &&
            !isTimerRunning && (
              <div
                className="flex items-center text-xs text-muted-foreground absolute bottom-4 left-1/2 -translate-x-1/2 hover:cursor-pointer hover:bg-primary/10 rounded-full"
                onClick={() => {
                  setSelectedProject(null)
                  setSelectedTask(null)
                }}
              >
                <XIcon className="size-4" />
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}








