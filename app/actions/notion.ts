'use server'

import {
  createNotionOAuthUrl,
  listDatabases,
  checkDatabaseProperties,
  fetchSyncedPages,
  convertPageToTask,
  updateNotionPage,
  NotionOAuthToken,
} from '@/lib/notion'
import { createTaskAction } from './tasks'
import { Task } from '@/types'

// Notion OAuth URL 생성
export async function getNotionAuthUrlAction() {
  return createNotionOAuthUrl()
}

// 데이터베이스 목록 조회
export async function listNotionDatabasesAction(token: NotionOAuthToken) {
  try {
    const databases = await listDatabases(token.access_token)
    return { success: true, databases }
  } catch (error) {
    console.error('Failed to list databases:', error)
    return { success: false, error: 'Failed to list databases' }
  }
}

// 데이터베이스 속성 확인
export async function checkNotionDatabaseAction(
  token: NotionOAuthToken,
  databaseId: string
) {
  try {
    const result = await checkDatabaseProperties(token.access_token, databaseId)
    return { success: true, ...result }
  } catch (error) {
    console.error('Failed to check database properties:', error)
    return { success: false, error: 'Failed to check database properties' }
  }
}

// Notion 페이지 동기화
export async function syncNotionDatabaseAction(
  token: NotionOAuthToken,
  databaseId: string
) {
  try {
    // 1. Fotion Sync가 체크된 페이지들 가져오기
    const pages = await fetchSyncedPages(token.access_token, databaseId)

    if (pages.length === 0) {
      return {
        success: true,
        message: '"Fotion Sync"가 체크된 페이지가 없습니다.',
        tasksCreated: 0,
      }
    }

    // 2. 각 페이지를 Task로 변환하여 생성
    let tasksCreated = 0
    for (const page of pages) {
      const taskData = convertPageToTask(page)
      const result = await createTaskAction(taskData)

      if (result.success) {
        tasksCreated++

        // 3. Notion에 Fotion ID 저장 (양방향 동기화 준비)
        if (result.task) {
          try {
            await updateNotionPage(token.access_token, page.id, result.task)
          } catch (error) {
            console.error('Failed to update Notion page with Fotion ID:', error)
          }
        }
      }
    }

    return {
      success: true,
      message: `${tasksCreated}개의 작업을 가져왔습니다.`,
      tasksCreated,
    }
  } catch (error) {
    console.error('Failed to sync Notion database:', error)
    return {
      success: false,
      error: 'Failed to sync Notion database',
    }
  }
}

// Task를 Notion에 업데이트 (양방향 동기화)
export async function updateNotionTaskAction(
  token: NotionOAuthToken,
  task: Task
) {
  if (!task.externalId) {
    return { success: false, error: 'Task has no external ID' }
  }

  try {
    await updateNotionPage(token.access_token, task.externalId, task)
    return { success: true }
  } catch (error) {
    console.error('Failed to update Notion page:', error)
    return { success: false, error: 'Failed to update Notion page' }
  }
}
