import { getLinearIssuesSchema } from "@/app/api/notion/search/database/page/[projectId]/type"
import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { LinearClient } from "@linear/sdk"
import { z } from "zod"

export async function GET(request: Request) {
    const user = await getDomainUserOrNull()
    if (!user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const linearIntegration = await prisma.linearIntegration.findUnique({
        where: {
            userId: user.id,
        },
    })

    if (!linearIntegration) {
        return new Response("Linear integration not found", { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const title = searchParams.get("title")
    if (!title) {
        return new Response("Title is required", { status: 400 })
    }

    const linearClient = new LinearClient({
        accessToken: linearIntegration.accessToken,
    })

    const me = await await linearClient.viewer
    const issues = await linearClient.issues({
        filter: {
            assignee: {
                id: {
                    eq: me.id,
                },
            },
            title: {
                contains: title ?? "",
            }
        },
    })

    const res: z.infer<typeof getLinearIssuesSchema> = issues.nodes.map((issue) => ({
        id: issue.id,
        title: issue.title,
        url: issue.url,
    }))

    return new Response(JSON.stringify(res),
        {
        status: 200,
        headers: {
            "Content-Type": "text/html",
        },
    })
}
