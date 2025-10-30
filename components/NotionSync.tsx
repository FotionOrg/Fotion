'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import {
  getNotionAuthUrlAction,
  listNotionDatabasesAction,
  checkNotionDatabaseAction,
  syncNotionDatabaseAction,
} from '@/app/actions/notion'
import { NotionOAuthToken } from '@/lib/notion'

const STORAGE_KEY = 'notion_oauth_token'
const DATABASE_KEY = 'notion_selected_database'

interface Database {
  id: string
  title: string
  url: string
  icon: any
  lastEditedTime: string
}

export default function NotionSync() {
  const [isConnected, setIsConnected] = useState(false)
  const [token, setToken] = useState<NotionOAuthToken | null>(null)
  const [databases, setDatabases] = useState<Database[]>([])
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>('')
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string>('')
  const [propertyCheck, setPropertyCheck] = useState<{
    hasFotionSync: boolean
    hasFotionId: boolean
  } | null>(null)

  // 저장된 토큰 및 선택된 데이터베이스 확인
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    const storedDatabase = localStorage.getItem(DATABASE_KEY)

    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken)
        setToken(parsedToken)
        setIsConnected(true)
        loadDatabases(parsedToken)
      } catch (error) {
        console.error('Failed to parse stored token:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    if (storedDatabase) {
      setSelectedDatabaseId(storedDatabase)
    }

    // URL에서 토큰 확인 (OAuth callback)
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('notion_token')
    const errorParam = params.get('notion_error')

    if (errorParam) {
      setSyncResult(`❌ 연결 실패: ${errorParam}`)
      // URL 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (tokenParam) {
      try {
        const decodedToken = JSON.parse(atob(tokenParam))
        setToken(decodedToken)
        setIsConnected(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decodedToken))
        setSyncResult('✅ Notion 연결 완료!')
        loadDatabases(decodedToken)
        // URL 파라미터 제거
        window.history.replaceState({}, '', window.location.pathname)
      } catch (error) {
        console.error('Failed to decode token:', error)
        setSyncResult('❌ 토큰 파싱 실패')
      }
    }
  }, [])

  // 선택된 데이터베이스의 속성 확인
  useEffect(() => {
    if (selectedDatabaseId && token) {
      checkDatabaseProperties()
    }
  }, [selectedDatabaseId, token])

  const loadDatabases = async (authToken: NotionOAuthToken) => {
    setIsLoadingDatabases(true)
    try {
      const result = await listNotionDatabasesAction(authToken)
      if (result.success && result.databases) {
        setDatabases(result.databases)
      } else {
        setSyncResult('❌ 데이터베이스 목록을 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to load databases:', error)
      setSyncResult('❌ 데이터베이스 목록 로딩 실패')
    } finally {
      setIsLoadingDatabases(false)
    }
  }

  const checkDatabaseProperties = async () => {
    if (!token || !selectedDatabaseId) return

    try {
      const result = await checkNotionDatabaseAction(token, selectedDatabaseId)
      if (result.success && 'hasFotionSync' in result && 'hasFotionId' in result) {
        setPropertyCheck({
          hasFotionSync: result.hasFotionSync || false,
          hasFotionId: result.hasFotionId || false,
        })
      }
    } catch (error) {
      console.error('Failed to check database properties:', error)
    }
  }

  const handleConnect = async () => {
    const authUrl = await getNotionAuthUrlAction()
    window.location.href = authUrl
  }

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(DATABASE_KEY)
    setToken(null)
    setIsConnected(false)
    setDatabases([])
    setSelectedDatabaseId('')
    setPropertyCheck(null)
    setSyncResult('연결이 해제되었습니다.')
  }

  const handleDatabaseSelect = (databaseId: string) => {
    setSelectedDatabaseId(databaseId)
    localStorage.setItem(DATABASE_KEY, databaseId)
    setSyncResult('')
  }

  const handleSync = async () => {
    if (!token || !selectedDatabaseId) return

    setIsSyncing(true)
    setSyncResult('')

    try {
      const result = await syncNotionDatabaseAction(token, selectedDatabaseId)

      if (result.success) {
        setSyncResult(`✅ ${result.message}`)
      } else {
        setSyncResult(`❌ 동기화 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncResult('❌ 동기화 중 오류 발생')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📝</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">Notion</h3>
          {isConnected && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            연결 해제
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
          >
            연결하기
          </button>
        )}
      </div>

      {isConnected && (
        <div className="space-y-3">
          {/* 데이터베이스 선택 */}
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              데이터베이스 선택:
            </label>
            {isLoadingDatabases ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>불러오는 중...</span>
              </div>
            ) : databases.length > 0 ? (
              <select
                value={selectedDatabaseId}
                onChange={(e) => handleDatabaseSelect(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">선택하세요</option>
                {databases.map((db) => (
                  <option key={db.id} value={db.id}>
                    {db.title}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-500">데이터베이스가 없습니다.</p>
            )}
          </div>

          {/* Property 확인 상태 */}
          {selectedDatabaseId && propertyCheck && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                {propertyCheck.hasFotionSync ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className={propertyCheck.hasFotionSync ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}>
                  Fotion Sync (Checkbox)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {propertyCheck.hasFotionId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className={propertyCheck.hasFotionId ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}>
                  Fotion ID (Text)
                </span>
              </div>
              {(!propertyCheck.hasFotionSync || !propertyCheck.hasFotionId) && (
                <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                  ⚠️ 필요한 Property를 추가해주세요
                </p>
              )}
            </div>
          )}

          {/* 동기화 버튼 */}
          {selectedDatabaseId && (
            <button
              onClick={handleSync}
              disabled={isSyncing || !propertyCheck?.hasFotionSync}
              className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>동기화 중...</span>
                </>
              ) : (
                <span>동기화 시작</span>
              )}
            </button>
          )}
        </div>
      )}

      {/* 결과 메시지 */}
      {syncResult && (
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
          {syncResult}
        </p>
      )}
    </div>
  )
}
