import { z } from "zod"

const scratchSchema = z.object({
  type: z.literal("SCRATCH"),
  name: z.string().min(1),
  description: z.string().optional(),
})

const notionSchema = z.object({
  type: z.literal("NOTION"),
  name: z.string().min(1),
  databaseId: z.string().min(1),
  notionIntegrationId: z.string().min(1),
  estimatedMinutesPropertyId: z.string().min(1),
  focusedMinutesPropertyId: z.string().min(1),
  titlePropertyId: z.string().min(1),
})

const linearSchema = z.object({
  type: z.literal("LINEAR"),
  name: z.string().min(1),
  linearIntegrationId: z.string().min(1),
})

export const formSchema = z.discriminatedUnion("type", [scratchSchema, notionSchema, linearSchema])

export const projectSchema = z.discriminatedUnion("sourceType", [
  z.object({
    id: z.string(),
    name: z.string(),
    sourceType: z.literal("SCRATCH"),
  }),
  z.object({
    id: z.string(),
    name: z.string(),
    sourceType: z.literal("NOTION"),
    databaseId: z.string(),
  }),
  z.object({
    id: z.string(),
    name: z.string(),
    sourceType: z.literal("LINEAR"),
  }),
])
