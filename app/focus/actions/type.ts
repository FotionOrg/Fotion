import { z } from "zod"

// Project 인터페이스: 코드에서 사용할 타입
export interface Project {
  id: string
  name: string
  sourceType: "SCRATCH" | "NOTION" | "LINEAR"
  databaseId?: string
  notionIntegrationId?: string
  linearIntegrationId?: string
  notionPropertyConfig?: NotionPropertyConfig
}

// Notion Property Config 타입
export interface NotionPropertyConfig {
  titlePropertyId: string
  estimatedMinutesPropertyId: string
  focusedMinutesPropertyId: string
}

// 프로젝트 생성 폼 스키마 (zod)
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

// 프로젝트 조회 결과 스키마 (zod)
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
