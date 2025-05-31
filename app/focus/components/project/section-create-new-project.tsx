import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { z } from "zod"
import { projectSchema } from "../../type"
import SectionCreateLinearProject from "./linear/form-wrapper"
import SectionCreateNotionProject from "./notion/form-wrapper"
import FormCreateScratchProject from "./scratch/form"

export default function CreateNewProject({
  setIsDialogOpen,
  notionIntegrationId,
  linearIntegrationId,
  projects,
}: {
  setIsDialogOpen: (open: boolean) => void
  notionIntegrationId: string | null
  linearIntegrationId: string | null
  userId: string
  projects: z.infer<typeof projectSchema>[]
}) {
  const [type, setType] = useState<"SCRATCH" | "NOTION" | "LINEAR">("SCRATCH")

  return (
    <div>
      <div className="space-y-4">
        <SelectProjectType type={type} setType={setType} />

        {type === "SCRATCH" && (
          <FormCreateScratchProject
            afterSubmitFn={() => {
              setIsDialogOpen(false)
            }}
          />
        )}

        {type === "NOTION" && (
          <SectionCreateNotionProject
            notionIntegrationId={notionIntegrationId}
            projects={projects}
            afterSubmitFn={() => {
              setIsDialogOpen(false)
            }}
          />
        )}

        {type === "LINEAR" && (
          <SectionCreateLinearProject
            linearIntegrationId={linearIntegrationId}
            projects={projects}
            afterSubmitFn={() => {
              setIsDialogOpen(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

function SelectProjectType({
  type,
  setType,
}: {
  type: "SCRATCH" | "NOTION" | "LINEAR"
  setType: (type: "SCRATCH" | "NOTION" | "LINEAR") => void
}) {
  return (
    <div>
      <Select
        value={type}
        onValueChange={(value) => {
          setType(value as "SCRATCH" | "NOTION" | "LINEAR")
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Project Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="SCRATCH" className="hover:bg-primary/10">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Scratch
              </div>
            </SelectItem>
            <SelectItem value="NOTION" className="hover:bg-primary/10">
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <Image src={"/images/notion.png"} fill alt="Notion Logo" className="object-contain" />
                </div>
                Notion
              </div>
            </SelectItem>
            <SelectItem value="LINEAR" className="hover:bg-primary/10">
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <Image src={"/images/linear.png"} fill alt="Linear Logo" className="object-contain" />
                </div>
                Linear
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
