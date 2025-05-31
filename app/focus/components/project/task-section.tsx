import { taskSchema } from "@/app/api/task/type"
import { XIcon } from "lucide-react"
import { useCallback, useEffect } from "react"
import { z } from "zod"
import { projectSchema } from "../../type"
import LinearTaskSelect from "../task/linear/select"
import NotionTaskSelect from "../task/notion/select"

export default function TaskSection({
  selectedProject,
  setSelectedProject,
  selectedTask,
  setSelectedTask,
}: {
  selectedProject: z.infer<typeof projectSchema> | null
  setSelectedProject: (project: z.infer<typeof projectSchema> | null) => void
  selectedTask: z.infer<typeof taskSchema> | null
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
}) {
  // ESC 키 핸들러 추가
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null)
      }
    },
    [setSelectedProject],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [handleEsc])

  return (
    <div>
      <div className="flex flex-row items-center gap-2 w-full justify-center mb-5">
        <XIcon className="size-4 cursor-pointer" onClick={() => setSelectedProject(null)} />
      </div>
      {selectedProject && selectedProject.sourceType === "NOTION" && (
        <NotionTaskSelect
          projectId={selectedProject.id}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
      )}
      {selectedProject && selectedProject.sourceType === "LINEAR" && (
        <LinearTaskSelect
          projectId={selectedProject.id}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
      )}
    </div>
  )
}
