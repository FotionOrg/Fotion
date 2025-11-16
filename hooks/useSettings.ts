import { useState } from 'react'
import { UserSettings } from '@/types'

const STORAGE_KEY = 'fotion-settings'

const defaultSettings: UserSettings = {
  defaultTimerDuration: 50, // 기본 50분
  theme: 'system', // 기본 시스템 설정 따름
  googleConnected: false,
  notionConnected: false,
  todoistConnected: false,
  linearConnected: false,
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return { ...defaultSettings, ...parsed }
      } catch (error) {
        console.error('Failed to parse settings:', error)
        return defaultSettings
      }
    }
    return defaultSettings
  })
  const [isLoaded] = useState(true)

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
