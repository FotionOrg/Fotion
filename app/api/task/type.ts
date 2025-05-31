import { z } from "zod"

export const requestSchema = z.object({
  vendorTaskId: z.string(),
  projectId: z.string(),
})

export type request = z.infer<typeof requestSchema>

export const taskSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMs: z.number(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  order: z.number(),
})

export const taskSchema = z.object({
  id: z.string(),
  vendorTaskId: z.string(),
  sessions: z.array(taskSessionSchema).optional(),
})
