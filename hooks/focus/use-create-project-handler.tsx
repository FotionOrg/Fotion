import { createProject } from "@/app/focus/actions"
import { formSchema } from "@/app/focus/type"
import { useProjectStore } from "@/stores/projectStore"
import { z } from "zod"

export default function useCreateProjectHandler(afterSubmitFn: () => void) {
  const setProjects = useProjectStore((state) => state.setProjects)
  const projects = useProjectStore.getState().projects
  async function handleSubmit(data: z.infer<typeof formSchema>) {
    const project = await createProject(data)

    if (project && "userId" in project) {
      if (project.sourceType === "SCRATCH") {
        setProjects([...projects, { id: project.id, name: project.name, sourceType: "SCRATCH" }])
      } else if (project.sourceType === "NOTION") {
        setProjects([
          ...projects,
          {
            id: project.id,
            name: project.name,
            sourceType: "NOTION",
            databaseId: project.notionDatabaseId ?? "",
          },
        ])
      } else if (project.sourceType === "LINEAR") {
        setProjects([...projects, { id: project.id, name: project.name, sourceType: "LINEAR" }])
      }

      afterSubmitFn()
    }
  }

  return handleSubmit
}
