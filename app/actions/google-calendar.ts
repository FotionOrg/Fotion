'use server'

import {
  generateAuthUrl,
  fetchCalendarEvents,
  convertEventToTask,
  refreshAccessToken,
  type GoogleOAuthToken,
} from '@/lib/google-calendar'
import { createTaskAction } from './tasks'

/**
 * Google Calendar 인증 URL 가져오기
 */
export async function getGoogleAuthUrlAction(): Promise<string> {
  return generateAuthUrl()
}

/**
 * Google Calendar 이벤트 동기화
 */
export async function syncGoogleCalendarAction(
  token: GoogleOAuthToken
): Promise<{ success: boolean; tasksCreated: number; error?: string }> {
  try {
    // 토큰 만료 확인 및 갱신
    let currentToken = token
    if (token.expiry_date && token.expiry_date < Date.now()) {
      if (!token.refresh_token) {
        throw new Error('Token expired and no refresh token available')
      }
      currentToken = await refreshAccessToken(token.refresh_token)
    }

    // 이번 주 이벤트 가져오기
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const events = await fetchCalendarEvents(currentToken, now, weekFromNow)

    // 이벤트를 Task로 변환 및 생성
    let tasksCreated = 0
    for (const event of events) {
      try {
        const taskData = convertEventToTask(event)
        await createTaskAction(taskData)
        tasksCreated++
      } catch (error) {
        console.error(`Failed to create task for event ${event.id}:`, error)
      }
    }

    return {
      success: true,
      tasksCreated,
    }
  } catch (error) {
    console.error('Failed to sync Google Calendar:', error)
    return {
      success: false,
      tasksCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
