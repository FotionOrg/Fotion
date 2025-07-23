import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { z } from "zod"
import { breakDurationSchema, request, requestSchema, taskSchema, TaskSession, taskSessionSchema } from "./type"
import { Prisma } from "@/prisma/app/generated/prisma/client"
import { Session } from "inspector/promises"

export async function POST(request: Request) {
  const user = await getDomainUserOrNull()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = requestSchema.parse(await request.json())
  let task = await prisma.task.findUnique({
    where: {
      projectId_vendorTaskId: {
        projectId: body.projectId,
        vendorTaskId: body.vendorTaskId,
      },
    },
  })
  if (!task) {
    const newTask = await prisma.task.create({
      data: {
        vendorTaskId: body.vendorTaskId,
        userId: user.id,
        projectId: body.projectId,
        duration: [
          {
            type: "BREAK",
            duration: 0,
          },
        ],
      },
    })
    task = newTask
  }

  if (!task) {
    return new Response("Error while getting task", { status: 500 })
  }

  const ret: z.infer<typeof taskSchema> = {
    id: task.id,
    vendorTaskId: task.vendorTaskId,
    duration: task.duration as z.infer<typeof breakDurationSchema>[],
    sessions: task.sessions.map((session: z.infer<typeof taskSessionSchema>) => ({
      id: session.id,
      name: session.name,
      duration: session.duration,
      createdAtMs: session.createdAtMs,
      updatedAtMs: session.updatedAtMs,
      order: session.order,
    })),
  }

  return new Response(JSON.stringify(ret), { status: 200 })
}

export async function GET(request: Request) {
  const user = await getDomainUserOrNull()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("taskId")

  if (!taskId) {
    return new Response("Task ID is required", { status: 400 })
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  })

  if (!task) {
    return new Response("Task not found", { status: 404 })
  }

  const ret: z.infer<typeof taskSchema> = {
    id: task.id,
    vendorTaskId: task.vendorTaskId,
    duration: task.duration as z.infer<typeof breakDurationSchema>[],
    sessions: task.sessions.map((session: z.infer<typeof taskSessionSchema>) => ({
      id: session.id,
      name: session.name,
      duration: session.duration,
      createdAtMs: session.createdAtMs,
      updatedAtMs: session.updatedAtMs,
      order: session.order,
    })),
  }

  return new Response(JSON.stringify(ret), { status: 200 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")
  const id = searchParams.get("taskId")
  if (!sessionId) {
    return new Response("Session ID is required", { status: 400 })
  }
  if (!id) {
    return new Response("ID is required", { status: 400 })
  }
  const user = await getDomainUserOrNull()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const task = await prisma.task.findUnique({ where: { id: id } })
  if (!task) {
    return new Response("Task is not found", { status: 404 })
  }

  const newSessions = task.sessions.filter((s: TaskSession) => s.id !== sessionId)

  // 3. update로 배열 전체를 다시 저장
  await prisma.task.update({
    where: { id: id },
    data: { sessions: newSessions },
  })

  return new Response(JSON.stringify(task), { status: 200 })
}
