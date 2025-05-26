import { prisma } from "@/app/pkg/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const userId = searchParams.get("state")
    if (!code || !userId) {
        return new Response("Invalid request", {
            status: 400,
        })
    }

    console.log("userId", userId)
    console.log("code", code)

    const params = new URLSearchParams({
        code: code ?? '',
        client_id: process.env.LINEAR_CLIENT_ID ?? '',
        client_secret: process.env.LINEAR_CLIENT_SECRET ?? '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/linear/webhook/oauth`,
        grant_type: "authorization_code",
    });

    const res = await fetch(
        `https://api.linear.app/oauth/token`,
        {
            method: "POST",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        },
    )

    const {access_token: accessToken} = await res.json()

    const linearIntegration = await prisma.linearIntegration.create({
        data: {
            userId: userId,
            accessToken: accessToken,
        },
    })

    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Complete Linear Integration</title>
            </head>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'LINEAR_INTEGRATION_COMPLETE',
                            linearIntegrationId: '${linearIntegration.id}'
                        }, window.location.origin);
                        window.close();
                    }
                </script>
                <p>Linear integration was successfully completed. This window will close automatically.</p>
            </body>
        </html>
    `

    return new Response(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html",
        },
    })
}
