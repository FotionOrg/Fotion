import { getNotionIntegration } from "@/app/focus/actions";
import { getDomainUserOrNull } from "@/lib/be/utils/user";
import { Client } from "@notionhq/client";
import { responseSchema } from "./type";

export async function GET(request: Request, {params}: {
    params: Promise<{ title: string }>
}) {
    const user = await getDomainUserOrNull()
    if (!user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const {title} = await params

    const notionIntegration = await getNotionIntegration(user.id)

    if (!notionIntegration) {
        return new Response("Notion integration not found", { status: 404 })
    }

    const notion = new Client({
        auth: notionIntegration.accessToken,
    })

    const res = await notion.search({
        query: title,
        filter: {
            property: "object",
            value: "database",
        },
        page_size: 100,
        sort: {
            direction: "descending",
            timestamp: "last_edited_time",
        },
    })

    const parsed = res.results
        .map(result => {
            if ("title" in result) {
                const properties = Object.keys(result.properties).map((key) => {
                    if (result.properties[key].id && result.properties[key].name) {
                        return {
                            name: result.properties[key].name,
                            id: result.properties[key].id,
                        }
                    }
                })

                return {
                    id: result.id,
                    name: result.title[0].plain_text,
                    properties: properties,
                }
            }
            return null
        })
        .filter((item) => item !== null)

    const validatedData = responseSchema.parse(parsed)

    return new Response(JSON.stringify(validatedData), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

