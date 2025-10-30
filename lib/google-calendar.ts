/**
 * Google Calendar API 통합
 * OAuth 2.0 인증 및 캘린더 이벤트 동기화
 */

import { google } from 'googleapis'
import { Task } from '@/types'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

/**
 * OAuth 토큰 타입
 */
export interface GoogleOAuthToken {
  access_token: string
  refresh_token?: string
  expiry_date?: number
  token_type: string
  scope: string
}

/**
 * Google Calendar 이벤트를 Task로 변환
 */
export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
}

/**
 * OAuth2 클라이언트 생성
 */
export function createOAuth2Client() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

/**
 * 인증 URL 생성
 */
export function generateAuthUrl(): string {
  const oauth2Client = createOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // refresh token 받기 위해 필요
    prompt: 'consent', // 매번 consent 화면 표시 (refresh token 받기 위해)
    scope: SCOPES,
  })
}

/**
 * 인증 코드로 토큰 교환
 */
export async function getTokenFromCode(code: string): Promise<GoogleOAuthToken> {
  const oauth2Client = createOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date || undefined,
    token_type: tokens.token_type || 'Bearer',
    scope: tokens.scope || SCOPES.join(' '),
  }
}

/**
 * 저장된 토큰으로 OAuth 클라이언트 설정
 */
export function setClientCredentials(token: GoogleOAuthToken) {
  const oauth2Client = createOAuth2Client()

  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: token.expiry_date,
    token_type: token.token_type,
    scope: token.scope,
  })

  return oauth2Client
}

/**
 * 토큰 갱신
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<GoogleOAuthToken> {
  const oauth2Client = createOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()

  return {
    access_token: credentials.access_token!,
    refresh_token: credentials.refresh_token || refreshToken,
    expiry_date: credentials.expiry_date || undefined,
    token_type: credentials.token_type || 'Bearer',
    scope: credentials.scope || SCOPES.join(' '),
  }
}

/**
 * Google Calendar 이벤트 가져오기
 */
export async function fetchCalendarEvents(
  token: GoogleOAuthToken,
  timeMin?: Date,
  timeMax?: Date
): Promise<CalendarEvent[]> {
  const oauth2Client = setClientCredentials(token)
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: (timeMin || new Date()).toISOString(),
    timeMax: timeMax?.toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return (response.data.items || []) as CalendarEvent[]
}

/**
 * Calendar 이벤트를 Task로 변환
 */
export function convertEventToTask(event: CalendarEvent): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  const startDateTime = event.start.dateTime || event.start.date
  const scheduledDate = startDateTime ? new Date(startDateTime) : undefined

  // 시간 추출 (dateTime이 있는 경우만)
  let scheduledTime: string | undefined
  if (event.start.dateTime) {
    const date = new Date(event.start.dateTime)
    scheduledTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 예상 소요 시간 계산 (start ~ end)
  let estimatedDuration: number | undefined
  if (event.start.dateTime && event.end.dateTime) {
    const start = new Date(event.start.dateTime)
    const end = new Date(event.end.dateTime)
    estimatedDuration = Math.round((end.getTime() - start.getTime()) / 60000) // 분 단위
  }

  return {
    title: event.summary || 'Untitled Event',
    content: event.description,
    status: 'todo',
    priority: 'medium',
    source: 'notion', // Google Calendar는 'notion'으로 표시 (또는 새로운 source 타입 추가)
    scheduledDate,
    scheduledTime,
    estimatedDuration,
    tags: ['google-calendar'],
  }
}
