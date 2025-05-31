"use client"

import { projectSchema } from "@/app/focus/type"
import { useState } from "react"
import { z } from "zod"
import SectionIntegrateLinear from "../../integrate/linear/section"
import FormLinearProject from "./form"

export default function SectionLinearProject({
  linearIntegrationId,
  projects,
  afterSubmitFn,
}: {
  linearIntegrationId: string | null
  projects: z.infer<typeof projectSchema>[]
  afterSubmitFn: () => void
}) {
  const [linearIntegration, setLinearIntegration] = useState<string | null>(linearIntegrationId)
  return (
    <div>
      {!linearIntegration ? (
        <SectionIntegrateLinear setLinearIntegration={setLinearIntegration} />
      ) : (
        <div>
          <FormLinearProject
            projects={projects}
            linearIntegrationId={linearIntegration}
            afterSubmitFn={afterSubmitFn}
          />
        </div>
      )}
    </div>
  )
}
