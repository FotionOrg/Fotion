'use client'

import { memo, useState, useEffect } from 'react'
import { getGoogleAuthUrlAction, syncGoogleCalendarAction } from '@/app/actions/google-calendar'
import { GoogleOAuthToken } from '@/lib/google-calendar'

const STORAGE_KEY = 'google_calendar_token'

function GoogleCalendarSync() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  // Save된 토큰 확인
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    if (storedToken) {
      try {
        const token: GoogleOAuthToken = JSON.parse(storedToken)
        // 토큰이 만료되지 않았는지 확인
        if (!token.expiry_date || token.expiry_date > Date.now()) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to parse stored token:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // URL에서 토큰 확인 (OAuth 콜백 후)
    const params = new URL(window.location.href).searchParams
    const tokenParam = params.get('token')
    if (tokenParam) {
      try {
        const decodedToken = Buffer.from(tokenParam, 'base64').toString()
        const token: GoogleOAuthToken = JSON.parse(decodedToken)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(token))
        setIsConnected(true)

        // URL에서 토큰 제거
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('google_auth')
        window.history.replaceState({}, '', url.toString())
      } catch (error) {
        console.error('Failed to process OAuth token:', error)
      }
    }
  }, [])

  const handleConnect = async () => {
    try {
      const authUrl = await getGoogleAuthUrlAction()
      window.location.href = authUrl
    } catch (error) {
      console.error('Failed to get auth URL:', error)
      alert('인증 URL을 가져오는데 실패했습니다.')
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsConnected(false)
    setLastSyncTime(null)
    setSyncResult(null)
  }

  const handleSync = async () => {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    if (!storedToken) {
      alert('먼저 Google 계정을 연결해주세요.')
      return
    }

    setIsSyncing(true)
    setSyncResult(null)

    try {
      const token: GoogleOAuthToken = JSON.parse(storedToken)
      const result = await syncGoogleCalendarAction(token)

      if (result.success) {
        setLastSyncTime(new Date())
        setSyncResult(`✅ ${result.tasksCreated}개의 Task을 가져왔습니다.`)
      } else {
        setSyncResult(`❌ 동기화 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncResult('❌ 동기화 중 오류가 발생했습니다.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h5v5h-5V6zm-1 0v5H6V6h5zm0 6h5v5h-5v-5zm-1 0v5H6v-5h5z"/>
          </svg>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Google Calendar
          </h3>
          {isConnected && (
            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
              연결됨
            </span>
          )}
        </div>

        {isConnected ? (
          <button
            onClick={handleDisconnect}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            연결 해제
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            연결하기
          </button>
        )}
      </div>

      {isConnected && (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Google Calendar의 이벤트를 Task으로 가져옵니다.
          </p>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSyncing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                동기화 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                이번 주 일정 동기화
              </>
            )}
          </button>

          {syncResult && (
            <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              {syncResult}
            </div>
          )}

          {lastSyncTime && (
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              마지막 동기화: {lastSyncTime.toLocaleString('ko-KR')}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(GoogleCalendarSync)
