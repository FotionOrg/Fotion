"use client"

import { useState } from "react"
import { z } from "zod"
import { taskSchema, taskSessionSchema } from "../api/task/type"
import ProjectSection from "./components/project/project-section"
import TimerSection from "./components/timer/timer-wrapper"
import { projectSchema } from "./type"

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
  const [selectedProject, setSelectedProject] = useState<z.infer<typeof projectSchema> | null>(null)
  const [selectedTask, setSelectedTask] = useState<z.infer<typeof taskSchema> | null>(null)
  const [selectedSession, setSelectedSession] = useState<z.infer<typeof taskSessionSchema> | null>(null)

  return (
    <div className="flex flex-row gap-4 w-full h-full">
      <div className="w-1/2">
        <ProjectSection
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          projects={projects}
          notionIntegrationId={notionIntegrationId}
          linearIntegrationId={linearIntegrationId}
          userId={userId}
        />
      </div>
      <div className="w-1/2">
        <TimerSection selectedProject={selectedProject} selectedTask={selectedTask} selectedSession={selectedSession} />
      </div>
    </div>
  )
}
