import { prisma } from "@/app/pkg/prisma"
import { Prisma } from "@/prisma/app/generated/prisma/client"
import { Client } from "@notionhq/client"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { projectId, taskId, sessionId, type, durationMinutes } = await request.json()

  if (!taskId) {
    return NextResponse.json({ error: "Error: taskId is required" }, { status: 400 })
  }
  if (!projectId) {
    return NextResponse.json({ error: "Error: projectId is required" }, { status: 400 })
  }

  if (durationMinutes === null) {
    return NextResponse.json({ error: "Error: durationMinutes is required" }, { status: 400 })
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

  if (type === "FOCUS") {
    const focusStep = session.duration.find((d) => d.type === "FOCUS")
    if (focusStep) {
      focusStep.duration += durationMinutes * 60 * 1000
    } else {
      task.sessions.push({
        id: crypto.randomUUID(),
        name: "New Session",
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
        order: task.sessions.length + 1,
        duration: [
          {
            type: "FOCUS",
            duration: durationMinutes * 60 * 1000,
          },
        ],
      })
    }
  }

  if (type === "BREAK") {
    const duration = task.duration as { type: "BREAK"; duration: number }[]
    const breakStep = duration.find((d) => d.type === "BREAK")
    if (breakStep) {
      breakStep.duration += durationMinutes * 60 * 1000
    } else {
      duration.push({ type: "BREAK", duration: durationMinutes * 60 * 1000 })
    }
  }

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      sessions: sessions,
      duration: task.duration,
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
