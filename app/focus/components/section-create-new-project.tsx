import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { z } from "zod"
import { projectSchema } from "../type"
import SectionCreateNotionProject from "./notion/section-create-notion-project"
import FormCreateScratchProject from "./scratch/form-create-scratch-project"

export default function CreateNewProject({
  setIsDialogOpen,
  notionIntegrationId,
  projects,
}: {
  setIsDialogOpen: (open: boolean) => void
  notionIntegrationId: string | null
  userId: string
  projects: z.infer<typeof projectSchema>[]
}) {
  const [type, setType] = useState<"scratch" | "notion">("scratch")

  return (
    <div>
      <div className="space-y-4">
        <SelectProjectType type={type} setType={setType} />

        {
          type === "scratch" &&
          <FormCreateScratchProject afterSubmitFn={() => {
            setIsDialogOpen(false)
          }} />
        }

        {
          type === "notion" &&
          <SectionCreateNotionProject
            notionIntegrationId={notionIntegrationId}
            projects={projects}
            afterSubmitFn={() => {
              setIsDialogOpen(false)
            }}
          />
        }
      </div>
    </div>
  )
}

function SelectProjectType({ type, setType }: { type: "scratch" | "notion", setType: (type: "scratch" | "notion") => void }) {
  return (
    <div>
      <Select
        value={type}
        onValueChange={(value) => {
          setType(value as "scratch" | "notion")
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Project Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              value="scratch"
              className="hover:bg-primary/10"
            >
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Scratch
              </div>
            </SelectItem>
            <SelectItem
              value="notion"
              className="hover:bg-primary/10"
            >
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <Image
                    src={"/images/notion.png"}
                    fill
                    alt="Notion Logo"
                    className="object-contain"
                  />
                </div>
                Notion
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}



