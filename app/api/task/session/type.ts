import { z } from "zod"
import { sessionStepSchema, taskSchema } from "../type"

export const requestSchema = z.object({
  taskId: z.string(),
  sessionName: z.string(),
  steps: z.array(sessionStepSchema),
})

export type request = z.infer<typeof requestSchema>

export const responseSchema = z.object({
  newSessionId: z.string(),
  task: taskSchema,
})

export type response = z.infer<typeof responseSchema>
