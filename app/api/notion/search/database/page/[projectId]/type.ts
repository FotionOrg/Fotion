import { z } from "zod"

export const databasePageSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
})

export const getDatabasePagesSchema = z.array(databasePageSchema)

export const linearIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
})

export const getLinearIssuesSchema = z.array(linearIssueSchema)
