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
      durationMs : number
      breakDurationMs :number
      createdAtMs: number
      updatedAtMs: number
      order: number // start from 1, 1 is the first session
    }
    type TaskSessions = TaskSession[]
  }
}

export {}
