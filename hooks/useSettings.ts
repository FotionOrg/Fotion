import { useState, useEffect } from 'react'
import { UserSettings } from '@/types'

const STORAGE_KEY = 'fotion-settings'

const defaultSettings: UserSettings = {
  defaultTimerDuration: 50, // 기본 50분
  googleConnected: false,
  notionConnected: false,
  todoistConnected: false,
  linearConnected: false,
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // 초기 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // 설정 업데이트
  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  }

  return {
    settings,
    updateSettings,
    isLoaded,
  }
}
