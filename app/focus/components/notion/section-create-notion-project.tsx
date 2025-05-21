"use client"
import { useState } from "react"
import { z } from "zod"
import { projectSchema } from "../../type"
import FormNotionProject from "./form-notion-project-selection"
import SectionIntegrateNotion from "./section-integrate-notion"

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
            {
                !notionIntegration ? (
                    <SectionIntegrateNotion
                        setNotionIntegration={setNotionIntegration}
                    />
                ) : (
                    <FormNotionProject
                        projects={projects}
                        notionIntegrationId={notionIntegration}
                        afterSubmitFn={afterSubmitFn}
                    />
                )
            }
        </div>
    )
}
