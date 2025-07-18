import { z } from "zod"
import { focusDurationSchema, taskSchema } from "../type"

export const requestSchema = z.object({
  taskId: z.string(),
  sessionName: z.string(),
  duration: z.array(focusDurationSchema),
})

export type request = z.infer<typeof requestSchema>

export const responseSchema = z.object({
  newSessionId: z.string(),
  task: taskSchema,
})

export type response = z.infer<typeof responseSchema>
