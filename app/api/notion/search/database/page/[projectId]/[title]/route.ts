'use server'
import { getNotionIntegration } from "@/app/focus/actions"
import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { Client } from "@notionhq/client"
import { getDatabasePagesSchema } from "../type"

export async function GET(request: Request, {params}: {
    params: Promise<{ projectId: string, title: string }>
}) {
    const {projectId, title} = await params

    const user = await getDomainUserOrNull()
    if (!user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const notionIntegration = await getNotionIntegration(user.id)
    if (!notionIntegration) {
        return new Response("Notion integration not found", { status: 404 })
    }

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    })

    if (!project) {
        return new Response("Project not found", { status: 404 })
    }

    if (project.sourceType !== "NOTION" || !project.notionDatabaseId || !project.notionPropertyConfig) {
        return new Response("Invalid project", { status: 400 })
    }

    const notion = new Client({
        auth: notionIntegration.accessToken,
    })

    const pages = await notion.databases.query({
        database_id: project?.notionDatabaseId,
        filter: {
            property: "title",
            title: {
                contains: title,
            },
        },
    })

    const titlePropertyId = project.notionPropertyConfig.titlePropertyId
    console.log(titlePropertyId)

    const parsedPages = pages.results.map((page) => {
        if (page.object === "page" && "properties" in page) {
            const titleProperty = Object.values(page.properties).find((property) => property.id === titlePropertyId)
            if (titleProperty?.type !== "title") {
                return new Response("Invalid title property", { status: 400 })
            }

            return {
                id: page.id,
                title: titleProperty.title[0].plain_text,
                url: page.id,
            }
        }
    })
    const parsed = getDatabasePagesSchema.parse(parsedPages)

    console.log(parsed)

    return new Response(JSON.stringify(parsed), { status: 200 })
}

