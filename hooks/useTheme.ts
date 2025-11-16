'use client'

import { useEffect } from 'react'

export function useTheme(theme: 'light' | 'dark' | 'system') {
  useEffect(() => {
    const root = window.document.documentElement

    // 이전 테마 클래스 제거
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      // 시스템 설정 따르기
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)

      // 시스템 테마 변경 감지
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // 사용자 지정 테마
      root.classList.add(theme)
    }
  }, [theme])
}
