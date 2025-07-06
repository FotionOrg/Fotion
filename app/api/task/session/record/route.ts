import { prisma } from "@/app/pkg/prisma"
import { Prisma } from "@/prisma/app/generated/prisma/client"
import { Client } from "@notionhq/client"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { projectId, taskId, sessionId, durationMinutes, breakDurationMinutes } = await request.json()

  if (!taskId || !projectId || (durationMinutes == null && breakDurationMinutes == null)) {
    return NextResponse.json({ error: "Error : taskId and projectId are required" }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 400 })
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 400 })
  }

  const sessions = task.sessions

  if (!sessions) {
    return NextResponse.json({ error: "Session not found" }, { status: 400 })
  }

  const session = sessions.find((session) => session.id === sessionId)

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 400 })
  }
  if (durationMinutes != null) {
  session.durationMs += durationMinutes * 60 * 1000
  } else{
  session.breakDurationMs += breakDurationMinutes * 60 * 1000
  }
  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      sessions: sessions,
    },
  })

  if (project.sourceType === "NOTION") {
    try {
      await recordNotion(task.vendorTaskId, project, durationMinutes)
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: "Failed to record notion" }, { status: 500 })
    }
  }

  return NextResponse.json({
    success: true,
  })
}

async function recordNotion(
  pageId: string,
  project: Prisma.ProjectGetPayload<{
    select: {
      notionIntegrationId: true
      notionPropertyConfig: true
    }
  }>,
  durationMinutes: number,
) {
  if (!project.notionIntegrationId) {
    throw new Error("Notion integration not found")
  }

  const notionIntegration = await prisma.notionIntegartion.findUnique({
    where: {
      id: project.notionIntegrationId,
    },
  })

  if (!notionIntegration) {
    throw new Error("Notion integration not found")
  }

  const notion = new Client({
    auth: notionIntegration.accessToken,
  })

  const page = await notion.pages.retrieve({
    page_id: pageId,
  })

  if (!page) {
    throw new Error("Page not found")
  }

  if (!("properties" in page)) {
    throw new Error("Page does not have properties")
  }

  const focusedMinuteRaw = Object.values(page.properties).find(
    (property) => property.id === project.notionPropertyConfig!.focusedMinutesPropertyId,
  )

  let focusedMinute = 0

  if (focusedMinuteRaw) {
    if (focusedMinuteRaw.type !== "number") {
      throw new Error("Focused minute is not a number")
    } else {
      focusedMinute = focusedMinuteRaw.number ?? 0
    }
  }

  if (!project.notionIntegrationId || !project.notionPropertyConfig) {
    throw new Error("Invalid project")
  }

  const res = await notion.pages.update({
    page_id: pageId,
    properties: {
      [project.notionPropertyConfig.focusedMinutesPropertyId]: {
        number: focusedMinute + (durationMinutes ? Number(durationMinutes) : 0),
      },
    },
  })

  if (!res) {
    throw new Error("Failed to update page")
  }
}
