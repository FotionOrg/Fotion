import { getDomainUserOrNull } from "@/lib/be/utils/user"

export async function GET(_request: Request) {
    const user = await getDomainUserOrNull()
    if (!user) {
        return new Response("Invalid request", { status: 400 })
    }

    const baseURL = "https://linear.app/oauth/authorize"
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINEAR_CLIENT_ID!,
        state: user.id,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/linear/webhook/oauth`,
        scope: "read",
    })

    const redirectURL = `${baseURL}?${params.toString()}`

    return Response.redirect(redirectURL)
}