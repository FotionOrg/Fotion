import { prisma } from "@/app/pkg/prisma"
import { Client } from "@notionhq/client"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('state')
    if (!code || !userId) {
        return new Response("Invalid request", {
            status: 400,
        })
    }

    const notion = new Client({
        auth: process.env.NOTION_CLIENT_SECRET,
    })

    const {access_token: accessToken} = await notion.oauth.token({
        client_id: process.env.NOTION_CLIENT_ID!,
        client_secret: process.env.NOTION_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/webhook/oauth`,
    })

    const notionIntegration = await prisma.notionIntegartion.create({
        data: {
            accessToken: accessToken,
            userId: userId,
        }
    })

    // HTML 응답을 반환하여 부모 창에 결과를 전달
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Notion 연동 완료</title>
            </head>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'NOTION_INTEGRATION_COMPLETE',
                            notionIntegrationId: '${notionIntegration.id}'
                        }, window.location.origin);
                        window.close();
                    }
                </script>
                <p>Notion 연동이 완료되었습니다. 이 창은 자동으로 닫힙니다.</p>
            </body>
        </html>
    `

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html'
        }
    })
}

