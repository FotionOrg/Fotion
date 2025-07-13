declare global {
  namespace PrismaJson {
    type NotionPropertyConfig = {
      titlePropertyId: string
      estimatedMinutesPropertyId: string
      focusedMinutesPropertyId: string
    }

    type TaskSessions = {
      id: string
      name: string
      type: "FOCUS" | "BREAK"
      durationMs: number
      breakDurationMs: number
      createdAtMs: number
      updatedAtMs: number
      order: number // start from 1, 1 is the first session
    }[]
  }
}

export {}
