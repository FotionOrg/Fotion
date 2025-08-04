import { projectSchema } from "@/app/focus/type"
import z from "zod"
import { create } from "zustand"

interface ProjectStore {
  projects: z.infer<typeof projectSchema>[]
  setProjects: (projects: z.infer<typeof projectSchema>[]) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
}))
