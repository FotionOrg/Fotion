import { z } from "zod"

export const requestSchema = z.object({
  vendorTaskId: z.string(),
  projectId: z.string(),
})

export type request = z.infer<typeof requestSchema>

export const focusStepSchema = z.object({
  type: z.literal("FOCUS"),
  duration: z.number(),
})

export const breakStepSchema = z.object({
  type: z.literal("BREAK"),
  duration: z.number(),
})

export const sessionStepSchema = z.union([focusStepSchema, breakStepSchema])

export const taskSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  steps: z.array(sessionStepSchema),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  order: z.number(),
})

export const taskSchema = z.object({
  id: z.string(),
  vendorTaskId: z.string(),
  sessions: z.array(taskSessionSchema).optional(),
})
