import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { z } from "zod"
import { breakDurationSchema, focusDurationSchema, taskSessionSchema } from "../type"
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
    duration: [
      {
        type: "FOCUS",
        duration: 0,
      },
    ],
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
      duration: updatedTask.duration as z.infer<typeof breakDurationSchema>[],
      sessions: updatedTask.sessions.map((session) => ({
        id: session.id,
        name: session.name,
        duration: session.duration as z.infer<typeof focusDurationSchema>[],
        createdAtMs: session.createdAtMs,
        updatedAtMs: session.updatedAtMs,
        order: session.order,
      })),
    },
  }

  return new Response(JSON.stringify(ret), { status: 200 })
}
