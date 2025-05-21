"use client"

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
import { z } from "zod"
import { projectSchema } from "../type"

export default function ProjectSelect({
    setIsDialogOpen,
    projects,
    setSelectedProject,
  }: {
    setIsDialogOpen: (open: boolean) => void
    projects: z.infer<typeof projectSchema>[]
    setSelectedProject: (project: z.infer<typeof projectSchema> | null) => void
  }) {
    return (
      <Select
        onValueChange={(value) => {
          if (value === "create-new") {
            setIsDialogOpen(true)
          } else {
            setSelectedProject(
              projects.find((project) => project.id === value) ?? null,
            )
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {projects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {project.sourceType === "NOTION" ? (
                    <div className="relative w-4 h-4">
                      <Image
                        src={"/images/notion.png"}
                        fill
                        alt="Notion Logo"
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
    )
  }