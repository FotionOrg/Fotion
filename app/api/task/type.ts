import { z } from "zod"

export const requestSchema = z.object({
  vendorTaskId: z.string(),
  projectId: z.string(),
})

export type request = z.infer<typeof requestSchema>

export const taskModeBaseSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  sessionId: z.string(),
  durationMs: z.number(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
})

export const taskFocusTimeSchema = taskModeBaseSchema.merge(
  z.object({
    durationMs: z.number(),
    type: z.literal("FOCUS"),
  }),
)

export const taskBreakTimeSchema = taskModeBaseSchema.merge(
  z.object({
    breakDurationMs: z.number(),
    type: z.literal("BREAK"),
  }),
)

export const taskModeSchema = z.discriminatedUnion("type", [taskFocusTimeSchema, taskBreakTimeSchema])

export const taskModeManagingSchema = z.object({
  id: z.string(),
  vendorTaskId: z.string(),
  sessions: z.array(taskModeSchema),
  type: z.enum(["BREAK", "FOCUS"]),
})
export const taskSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMs: z.number(),
  breakDurationMs: z.number(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  order: z.number(),
})
export const taskSchema = z.object({
  id: z.string(),
  vendorTaskId: z.string(),
  sessions: z.array(taskSessionSchema).optional(),
})
