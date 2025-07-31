import { projectSchema } from "@/app/focus/type"
import z from "zod"
import { create } from "zustand"

type Project = z.infer<typeof projectSchema>

interface ProjectStore {
  projects: Project[]
  setProjects: (projects: Project[]) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
}))
