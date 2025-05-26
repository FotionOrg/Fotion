import { getDomainUserOrNull } from "@/lib/be/utils/user"

export async function GET(_request: Request) {
    const user = await getDomainUserOrNull()
    if (!user) {
        return new Response("Invalid request", { status: 400 })
    }

    const baseURL = "https://api.notion.com/v1/oauth/authorize"
    const params = new URLSearchParams({
        client_id: process.env.NOTION_CLIENT_ID!,
        response_type: "code",
        owner: "user",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/webhook/oauth`,
        state: user.id,
    })

    const redirectURL = `${baseURL}?${params.toString()}`

    return Response.redirect(redirectURL)
}