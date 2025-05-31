"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { z } from "zod"
import { projectSchema } from "../../type"
import CreateNewProject from "./section-create-new-project"

const projectIconMap = {
  NOTION: { icon: "/images/notion.png", name: "Notion" },
  LINEAR: { icon: "/images/linear.png", name: "Linear" },
}

export default function ProjectSelect({
  projects,
  setSelectedProject,
  notionIntegrationId,
  linearIntegrationId,
  userId,
}: {
  projects: z.infer<typeof projectSchema>[]
  setSelectedProject: (project: z.infer<typeof projectSchema> | null) => void
  notionIntegrationId: string | null
  linearIntegrationId: string | null
  userId: string
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <>
      <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <DialogDescription>Add a new project to your account.</DialogDescription>

            <CreateNewProject
              setIsDialogOpen={setIsDialogOpen}
              notionIntegrationId={notionIntegrationId}
              linearIntegrationId={linearIntegrationId}
              userId={userId}
              projects={projects}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Select
        onValueChange={(value) => {
          if (value === "create-new") {
            setIsDialogOpen(true)
          } else {
            setSelectedProject(projects.find((project) => project.id === value) ?? null)
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {project.sourceType !== "SCRATCH" ? (
                    <div className="relative w-4 h-4">
                      <Image
                        src={projectIconMap[project.sourceType].icon}
                        fill
                        alt={projectIconMap[project.sourceType].name}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  <span>{project.name}</span>
                </div>
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="create-new">Add New Project</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
