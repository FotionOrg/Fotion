'use client'

import { AppTab } from '@/types'

interface BottomTabBarProps {
  currentTab: AppTab
  onTabChange: (tab: AppTab) => void
  isVisible?: boolean // 집중 모드 시 숨김
}

export default function BottomTabBar({ currentTab, onTabChange, isVisible = true }: BottomTabBarProps) {
  if (!isVisible) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        <button
          onClick={() => onTabChange('visualization')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'visualization'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs mt-1">시각화</span>
        </button>

        <button
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'tasks'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="text-xs mt-1">작업</span>
        </button>
      </div>
    </nav>
  )
}
