import { prisma } from "@/app/pkg/prisma"
import { Client } from "@notionhq/client"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { pageId, projectId, durationMinutes } = await request.json()

  if (!pageId || !projectId || !durationMinutes || isNaN(Number(durationMinutes))) {
    return NextResponse.json({ error: "taskId and projectId are required" }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 400 })
  }

  if (!project.notionIntegrationId || !project.notionPropertyConfig) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 })
  }

  const notionIntegration = await prisma.notionIntegartion.findUnique({
    where: {
      id: project.notionIntegrationId,
    },
  })

  if (!notionIntegration) {
    return NextResponse.json({ error: "Notion integration not found" }, { status: 400 })
  }

  const notion = new Client({
    auth: notionIntegration.accessToken,
  })

  const page = await notion.pages.retrieve({
    page_id: pageId,
  })

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 400 })
  }

  if (!("properties" in page)) {
    return NextResponse.json({ error: "Page does not have properties" }, { status: 400 })
  }
  
  const focusedMinuteRaw = Object.values(page.properties).find(
    (property) => property.id === project.notionPropertyConfig!.focusedMinutesPropertyId,
  )

  let focusedMinute = 0

  if (focusedMinuteRaw) {
    if (focusedMinuteRaw.type !== "number") {
      return NextResponse.json({ error: "Focused minute is not a number" }, { status: 400 })
    } else {
      focusedMinute = focusedMinuteRaw.number ?? 0
    }
  }

  console.log(focusedMinute, durationMinutes)

  const res = await notion.pages.update({
    page_id: pageId,
    properties: {
      [project.notionPropertyConfig.focusedMinutesPropertyId]: {
        number: focusedMinute + (durationMinutes ? Number(durationMinutes) : 0),
        },
      },
    })

  if (!res) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
  })
}
