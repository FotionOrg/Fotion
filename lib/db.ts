/**
 * 서버 사이드 메모리 기반 데이터 스토어
 * AsyncLocalStorage 패턴을 사용한 전역 데이터 관리
 */

import { Task, FocusSession } from '@/types'
import { mockTasks, mockFocusSessions } from './mockData'

// 전역 데이터 스토어
class DataStore {
  private tasks: Task[] = []
  private sessions: FocusSession[] = []

  constructor() {
    // 초기 mock 데이터 로드
    this.tasks = mockTasks
    this.sessions = mockFocusSessions
  }

  // ===== Tasks =====
  getTasks(): Task[] {
    return [...this.tasks]
  }

  getTask(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id)
  }

  addTask(task: Task): Task {
    this.tasks.push(task)
    return task
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) return null

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date(),
    }
    return this.tasks[index]
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) return false

    this.tasks.splice(index, 1)
    return true
  }

  // ===== Focus Sessions =====
  getSessions(): FocusSession[] {
    return [...this.sessions]
  }

  getSession(id: string): FocusSession | undefined {
    return this.sessions.find(s => s.id === id)
  }

  addSession(session: FocusSession): FocusSession {
    this.sessions.push(session)
    return session
  }

  updateSession(id: string, updates: Partial<FocusSession>): FocusSession | null {
    const index = this.sessions.findIndex(s => s.id === id)
    if (index === -1) return null

    this.sessions[index] = {
      ...this.sessions[index],
      ...updates,
    }
    return this.sessions[index]
  }

  deleteSession(id: string): boolean {
    const index = this.sessions.findIndex(s => s.id === id)
    if (index === -1) return false

    this.sessions.splice(index, 1)
    return true
  }

  // ===== 통계 쿼리 =====
  getSessionsByDateRange(startDate: Date, endDate: Date): FocusSession[] {
    return this.sessions.filter(session => {
      const sessionDate = session.startTime
      return sessionDate >= startDate && sessionDate <= endDate
    })
  }

  getSessionsByTaskId(taskId: string): FocusSession[] {
    return this.sessions.filter(session => session.taskId === taskId)
  }

  getTodaySessions(): FocusSession[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getSessionsByDateRange(today, tomorrow)
  }
}

// 싱글톤 인스턴스
let db: DataStore | null = null

export function getDB(): DataStore {
  if (!db) {
    db = new DataStore()
  }
  return db
}

// 편의 함수들
export const getTasks = () => getDB().getTasks()
export const getSessions = () => getDB().getSessions()
