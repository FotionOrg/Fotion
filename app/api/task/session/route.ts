import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { z } from "zod"
import { taskSessionSchema, TaskSession } from "../type"
import { requestSchema, responseSchema } from "./type"

export async function POST(request: Request) {
  const user = await getDomainUserOrNull()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = requestSchema.parse(await request.json())

  const task = await prisma.task.findUnique({
    where: {
      id: body.taskId,
    },
  })

  if (!task) {
    return new Response("Task not found", { status: 404 })
  }

  const newSession: z.infer<typeof taskSessionSchema> = {
    id: crypto.randomUUID(),
    name: body.sessionName,
    type: body.type as "FOCUS" | "BREAK",
    durationMs: 0,
    breakDurationMs: 0,
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
    order: task.sessions.length + 1,
  }
  task.sessions.push(newSession)

  const updatedTask = await prisma.task.update({
    where: {
      id: body.taskId,
    },
    data: {
      sessions: task.sessions,
    },
  })

  const ret: z.infer<typeof responseSchema> = {
    newSessionId: newSession.id,
    task: {
      id: updatedTask.id,
      vendorTaskId: updatedTask.vendorTaskId,
      sessions: updatedTask.sessions.map((session: TaskSession) => ({
        id: session.id,
        name: session.name,
        type: session.type as "FOCUS" | "BREAK",
        durationMs: session.durationMs,
        breakDurationMs: session.breakDurationMs,
        createdAtMs: session.createdAtMs,
        updatedAtMs: session.updatedAtMs,
        order: session.order,
      })),
    },
  }

  return new Response(JSON.stringify(ret), { status: 200 })
}
