import { z } from "zod"

export const requestSchema = z.object({
  vendorTaskId: z.string(),
  projectId: z.string(),
})

export interface TaskSession {
  id: string
  name: string
  type: "FOCUS" | "BREAK"
  durationMs: number
  breakDurationMs: number
  createdAtMs: number
  updatedAtMs: number
  order: number
}

export type request = z.infer<typeof requestSchema>

export const focusDurationSchema = z.object({
  type: z.literal("FOCUS"),
  duration: z.number(),
})

export const breakDurationSchema = z.object({
  type: z.literal("BREAK"),
  duration: z.number(),
})

export const taskSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.array(focusDurationSchema),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  order: z.number(),
})

export const taskSchema = z.object({
  id: z.string(),
  vendorTaskId: z.string(),
  duration: z.array(breakDurationSchema),
  sessions: z.array(taskSessionSchema),
})
