import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { z } from "zod"
import { requestSchema, taskSchema, TaskSession } from "./type"

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
    sessions: task.sessions.map((session: TaskSession) => ({
      id: session.id,
      name: session.name,
      type: session.type,
      durationMs: session.durationMs,
      breakDurationMs: session.breakDurationMs,
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
    sessions: task.sessions.map((session: TaskSession) => ({
      id: session.id,
      name: session.name,
      type: session.type,
      durationMs: session.durationMs,
      breakDurationMs: session.breakDurationMs,
      createdAtMs: session.createdAtMs,
      updatedAtMs: session.updatedAtMs,
      order: session.order,
    })),
  }

  return new Response(JSON.stringify(ret), { status: 200 })
}
