'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'fotion2-task-queue'

export function useTaskQueue() {
  const [taskQueue, setTaskQueue] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // LocalStorage에서 작업 큐 로드
  useEffect(() => {
    const loadQueue = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setTaskQueue(parsed)
        }
      } catch (error) {
        console.error('Failed to load task queue:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadQueue()
  }, [])

  // LocalStorage에 작업 큐 저장
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(taskQueue))
      } catch (error) {
        console.error('Failed to save task queue:', error)
      }
    }
  }, [taskQueue, isLoaded])

  // 작업 큐에 추가
  const addToQueue = (taskId: string) => {
    setTaskQueue(prev => {
      if (prev.includes(taskId)) {
        return prev
      }
      return [...prev, taskId]
    })
  }

  // 작업 큐에서 제거
  const removeFromQueue = (taskId: string) => {
    setTaskQueue(prev => prev.filter(id => id !== taskId))
  }

  // 작업 큐 순서 변경
  const reorderQueue = (startIndex: number, endIndex: number) => {
    setTaskQueue(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }

  // 작업 큐 초기화
  const clearQueue = () => {
    setTaskQueue([])
  }

  return {
    taskQueue,
    isLoaded,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  }
}
