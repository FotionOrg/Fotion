import { prisma } from "@/app/pkg/prisma"
import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { z } from "zod"
import { requestSchema, taskSchema } from "./type"

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
    sessions: task.sessions.map((session) => ({
      id: session.id,
      name: session.name,
      durationMs: session.durationMs,
      createdAtMs: session.createdAtMs,
      updatedAtMs: session.updatedAtMs,
      order: session.order,
    })),
  }

  return new Response(JSON.stringify(ret), { status: 200 })
}
