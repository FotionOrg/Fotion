"use client"

import { projectSchema } from "@/app/focus/type"
import { useState } from "react"
import { z } from "zod"
import SectionIntegrateNotion from "../../integrate/notion/section"
import FormNotionProject from "./form"

export default function SectionNotionProject({
  notionIntegrationId,
  projects,
  afterSubmitFn,
}: {
  notionIntegrationId: string | null
  projects: z.infer<typeof projectSchema>[]
  afterSubmitFn: () => void
}) {
  const [notionIntegration, setNotionIntegration] = useState(notionIntegrationId)
  return (
    <div>
      {!notionIntegration ? (
        <SectionIntegrateNotion setNotionIntegration={setNotionIntegration} />
      ) : (
        <FormNotionProject projects={projects} notionIntegrationId={notionIntegration} afterSubmitFn={afterSubmitFn} />
      )}
    </div>
  )
}
