import { taskSchema, taskSessionSchema } from "@/app/api/task/type"
import { z } from "zod"
import { projectSchema } from "../../type"
import ProjectSelect from "./select-project"
import SessionJourneySection from "./session-journey-section"
import TaskSection from "./task-section"

export default function ProjectSection({
  selectedProject,
  setSelectedProject,
  selectedTask,
  setSelectedTask,
  selectedSession,
  setSelectedSession,
  projects,
  notionIntegrationId,
  linearIntegrationId,
  userId,
}: {
  selectedProject: z.infer<typeof projectSchema> | null
  setSelectedProject: (project: z.infer<typeof projectSchema> | null) => void
  selectedTask: z.infer<typeof taskSchema> | null
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
  selectedSession: z.infer<typeof taskSessionSchema> | null
  setSelectedSession: (session: z.infer<typeof taskSessionSchema> | null) => void
  projects: z.infer<typeof projectSchema>[]
  notionIntegrationId: string | null
  linearIntegrationId: string | null
  userId: string
}) {
  const mockSessions = []
  for (let i = 1; i <= 10; i++) {
    mockSessions.push({
      id: i.toString(),
      name: `Session ${i}`,
      durationMs: i * 1000,
      createdAtMs: 1717334400000,
      updatedAtMs: 1717334400000,
      order: i,
    })
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {!selectedProject && (
        <ProjectSelect
          setSelectedProject={setSelectedProject}
          projects={projects}
          notionIntegrationId={notionIntegrationId}
          linearIntegrationId={linearIntegrationId}
          userId={userId}
        />
      )}
      {selectedProject && !selectedTask && (
        <TaskSection
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
      )}
      {selectedProject && selectedTask && (
        <SessionJourneySection
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
        />
      )}
    </div>
  )
}
