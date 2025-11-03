/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@notionhq/client'
import { Task } from '@/types'

export interface NotionOAuthToken {
  access_token: string
  token_type: string
  bot_id: string
  workspace_id: string
  workspace_name?: string
  workspace_icon?: string
  duplicated_template_id?: string
}

// Notion OAuth Client 생성
export function createNotionOAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`

  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('owner', 'user')
  authUrl.searchParams.set('redirect_uri', redirectUri)

  return authUrl.toString()
}

// Authorization Code를 Access Token으로 교환
export async function exchangeCodeForToken(code: string): Promise<NotionOAuthToken> {
  const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

// Notion Client 생성
export function createNotionClient(accessToken: string) {
  return new Client({ auth: accessToken })
}

// 사용자가 접근 가능한 데이터베이스 목록 조회
export async function listDatabases(accessToken: string) {
  const notion = createNotionClient(accessToken)

  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'database' as any,
    },
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time',
    },
  })

  return response.results.map((db: any) => ({
    id: db.id,
    title: db.title?.[0]?.plain_text || 'Untitled',
    url: db.url,
    icon: db.icon,
    lastEditedTime: db.last_edited_time,
  }))
}

// 데이터베이스의 속성(Properties) 확인
export async function checkDatabaseProperties(accessToken: string, databaseId: string) {
  const notion = createNotionClient(accessToken)

  const database = await notion.databases.retrieve({ database_id: databaseId })

  if (!('properties' in database)) {
    return {
      success: false,
      error: 'Database properties not accessible'
    }
  }

  const properties = database.properties as any

  const hasFotionSync = 'Fotion Sync' in properties && properties['Fotion Sync'].type === 'checkbox'
  const hasFotionId = 'Fotion ID' in properties && properties['Fotion ID'].type === 'rich_text'

  return {
    success: true,
    hasFotionSync,
    hasFotionId,
    properties: Object.keys(properties).map(key => ({
      name: key,
      type: properties[key].type,
    })),
  }
}

// 데이터베이스에서 Fotion Sync가 체크된 항목들 가져오기
export async function fetchSyncedPages(accessToken: string, databaseId: string) {
  const notion = createNotionClient(accessToken)

  const response = await (notion.databases as any).query({
    database_id: databaseId,
    filter: {
      property: 'Fotion Sync',
      checkbox: {
        equals: true,
      },
    },
  })

  return response.results
}

// Notion Page를 Fotion Task로 변환
export function convertPageToTask(page: any): Omit<Task, 'id'> {
  // 제목 추출
  const titleProperty = Object.values(page.properties).find(
    (prop: any) => prop.type === 'title'
  ) as any
  const title = titleProperty?.title?.[0]?.plain_text || 'Untitled'

  // Fotion ID 추출
  const fotionIdProperty = page.properties['Fotion ID'] as any
  const fotionId = fotionIdProperty?.rich_text?.[0]?.plain_text || null

  // 상태 추출 (Status property가 있다면)
  const statusProperty = page.properties['Status'] as any
  let status: Task['status'] = 'todo'
  if (statusProperty?.select?.name) {
    const statusName = statusProperty.select.name.toLowerCase()
    if (statusName.includes('progress') || statusName.includes('doing')) {
      status = 'in_progress'
    } else if (statusName.includes('done') || statusName.includes('complete')) {
      status = 'completed'
    }
  }

  // 날짜 추출 (Date property가 있다면)
  const dateProperty = page.properties['Date'] as any
  let scheduledDate: Date | undefined
  if (dateProperty?.date?.start) {
    scheduledDate = new Date(dateProperty.date.start)
  }

  // 우선순위 추출 (Priority property가 있다면)
  const priorityProperty = page.properties['Priority'] as any
  let priority: Task['priority'] = undefined
  if (priorityProperty?.select?.name) {
    const priorityName = priorityProperty.select.name.toLowerCase()
    if (priorityName.includes('high')) priority = 'high'
    else if (priorityName.includes('medium')) priority = 'medium'
    else if (priorityName.includes('low')) priority = 'low'
  }

  return {
    title,
    content: '', // Notion 페이지 본문은 별도 API 호출 필요
    status,
    source: 'notion',
    scheduledDate,
    priority,
    tags: [],
    createdAt: new Date(page.created_time),
    updatedAt: new Date(page.last_edited_time),
    externalId: page.id, // Notion Page ID 저장
    externalData: fotionId ? { fotionId } : undefined,
  }
}

// Fotion Task를 Notion Page에 업데이트 (양방향 동기화)
export async function updateNotionPage(
  accessToken: string,
  pageId: string,
  task: Task
) {
  const notion = createNotionClient(accessToken)

  const properties: any = {}

  // Fotion ID 업데이트
  if (task.id) {
    properties['Fotion ID'] = {
      rich_text: [{ text: { content: task.id } }],
    }
  }

  // 상태 업데이트 (Status property가 있다면)
  if (task.status) {
    const statusMap = {
      todo: 'Todo',
      in_progress: 'In Progress',
      completed: 'Done',
    }
    properties['Status'] = {
      select: { name: statusMap[task.status] },
    }
  }

  // 날짜 업데이트 (Date property가 있다면)
  if (task.scheduledDate) {
    properties['Date'] = {
      date: { start: task.scheduledDate.toISOString().split('T')[0] },
    }
  }

  await notion.pages.update({
    page_id: pageId,
    properties,
  })
}
