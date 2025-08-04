import { taskSchema, taskSessionSchema } from "@/app/api/task/type"
import { useProjectStore } from "@/stores/projectStore"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { getProjects } from "../../actions"
import { projectSchema } from "../../type"
import ProjectSelect from "./select-project"
import SessionJourneySection from "./session-journey-section"
import TaskSection from "./task-section"

function useFetchProjects(userId: string) {
  const setProjects = useProjectStore((state) => state.setProjects)

  return useQuery({
    queryKey: ["projects", userId],
    queryFn: async () => {
      const result = await getProjects(userId)
      setProjects(result)
      return result
    },
  })
}

export default function ProjectSection({
  selectedProject,
  setSelectedProject,
  selectedTask,
  setSelectedTask,
  selectedSession,
  projects,
  setSelectedSession,
  notionIntegrationId,
  linearIntegrationId,
  userId,
  isTimerRunning,
  setIsTimerRunning,
}: {
  selectedProject: z.infer<typeof projectSchema> | null
  setSelectedProject: (project: z.infer<typeof projectSchema> | null) => void
  selectedTask: z.infer<typeof taskSchema> | null
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
  selectedSession: z.infer<typeof taskSessionSchema> | null
  setSelectedSession: (session: z.infer<typeof taskSessionSchema> | null) => void
  isTimerRunning: boolean
  setIsTimerRunning: (isTimerRunning: boolean) => void

  projects: z.infer<typeof projectSchema>[]
  notionIntegrationId: string | null
  linearIntegrationId: string | null
  userId: string
}) {
  const projectStore = useProjectStore((state) => state.projects) // zustand 데이터 사용

  useFetchProjects(userId) // zustand 갱신
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {!selectedProject && (
        <ProjectSelect
          setSelectedProject={setSelectedProject}
          projects={projectStore || projects}
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
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
        />
      )}
      {selectedProject && selectedTask && (
        <SessionJourneySection
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          isTimerRunning={isTimerRunning}
        />
      )}
    </div>
  )
}
