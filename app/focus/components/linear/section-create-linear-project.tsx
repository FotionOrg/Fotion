"use client"
import { useState } from "react"
import { z } from "zod"
import { projectSchema } from "../../type"
import FormLinearProject from "./form-linear-project-selection"
import SectionIntegrateLinear from "./section-integrate-linear"

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
            {
                !linearIntegration ? (
                    <SectionIntegrateLinear
                        setLinearIntegration={setLinearIntegration}
                    />
                ) : (
                    <div>
                        <FormLinearProject
                            projects={projects}
                            linearIntegrationId={linearIntegration}
                            afterSubmitFn={afterSubmitFn}
                        />
                    </div>
                )
            }
        </div>
    )
}
