'use client'

import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  category: string
  action: () => void
}

/**
 * 키보드 단축키 hook
 * 전역 단축키를 등록하고 관리
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // input, textarea에서는 단축키 무시
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey

        // key는 대소문자 구분 없이 비교
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * 단축키를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }

  // 특수 키 변환
  let key = shortcut.key
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'escape': 'Esc',
    'enter': '↵',
  }

  key = specialKeys[key.toLowerCase()] || key.toUpperCase()
  parts.push(key)

  return parts.join(isMac ? '' : '+')
}
