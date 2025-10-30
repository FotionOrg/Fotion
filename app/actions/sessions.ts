'use server'

import { FocusSession, TimerMode } from '@/types'
import { getDB } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSessionsAction(): Promise<FocusSession[]> {
  const db = getDB()
  return db.getSessions()
}

export async function getSessionAction(id: string): Promise<FocusSession | null> {
  const db = getDB()
  return db.getSession(id) || null
}

export async function createSessionAction(
  taskId: string,
  taskTitle: string,
  mode: TimerMode,
  duration?: number
): Promise<FocusSession> {
  const db = getDB()

  const newSession: FocusSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId,
    taskTitle,
    startTime: new Date(),
    endTime: null,
    duration: 0,
    mode,
    targetDuration: duration,
    isCompleted: false,
  }

  db.addSession(newSession)
  revalidatePath('/')

  return newSession
}

export async function updateSessionAction(
  id: string,
  updates: Partial<FocusSession>
): Promise<FocusSession | null> {
  const db = getDB()
  const updated = db.updateSession(id, updates)

  if (updated) {
    revalidatePath('/')
  }

  return updated
}

export async function endSessionAction(
  id: string,
  isCompleted: boolean
): Promise<FocusSession | null> {
  const db = getDB()
  const session = db.getSession(id)

  if (!session) return null

  const endTime = new Date()
  const duration = endTime.getTime() - session.startTime.getTime()

  const updated = db.updateSession(id, {
    endTime,
    duration,
    isCompleted,
  })

  if (updated) {
    revalidatePath('/')
  }

  return updated
}

export async function deleteSessionAction(id: string): Promise<boolean> {
  const db = getDB()
  const deleted = db.deleteSession(id)

  if (deleted) {
    revalidatePath('/')
  }

  return deleted
}

// 통계 쿼리
export async function getTodaySessionsAction(): Promise<FocusSession[]> {
  const db = getDB()
  return db.getTodaySessions()
}

export async function getSessionsByTaskIdAction(taskId: string): Promise<FocusSession[]> {
  const db = getDB()
  return db.getSessionsByTaskId(taskId)
}

export async function getSessionsByDateRangeAction(
  startDate: Date,
  endDate: Date
): Promise<FocusSession[]> {
  const db = getDB()
  return db.getSessionsByDateRange(startDate, endDate)
}
