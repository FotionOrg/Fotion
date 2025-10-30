'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FocusSession, TimerMode } from '@/types'
import {
  getSessionsAction,
  createSessionAction,
  endSessionAction,
  deleteSessionAction,
} from '@/app/actions/sessions'

/**
 * React Query를 사용하는 FocusSessions hook
 * - 자동 캐싱 및 refetching
 * - Optimistic updates
 * - 캐시 무효화
 */
export function useFocusSessions() {
  const queryClient = useQueryClient()

  // Sessions 조회 (자동 캐싱)
  const {
    data: sessions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessionsAction,
  })

  // Session 생성 (집중 모드 시작)
  const createMutation = useMutation({
    mutationFn: ({
      taskId,
      taskTitle,
      mode,
      targetDuration,
    }: {
      taskId: string
      taskTitle: string
      mode: TimerMode
      targetDuration?: number
    }) => createSessionAction(taskId, taskTitle, mode, targetDuration),
    onMutate: async ({ taskId, taskTitle, mode, targetDuration }) => {
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      const previousSessions = queryClient.getQueryData<FocusSession[]>(['sessions'])

      // Optimistic update
      const optimisticSession: FocusSession = {
        id: `temp-session-${Date.now()}`,
        taskId,
        taskTitle,
        startTime: new Date(),
        endTime: null,
        duration: 0,
        isCompleted: false,
        mode,
        targetDuration,
      }

      queryClient.setQueryData<FocusSession[]>(['sessions'], (old = []) => [
        ...old,
        optimisticSession,
      ])

      return { previousSessions }
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // Session 종료
  const endMutation = useMutation({
    mutationFn: ({
      sessionId,
      isCompleted,
    }: {
      sessionId: string
      isCompleted: boolean
    }) => endSessionAction(sessionId, isCompleted),
    onMutate: async ({ sessionId, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      const previousSessions = queryClient.getQueryData<FocusSession[]>(['sessions'])

      // Optimistic update
      queryClient.setQueryData<FocusSession[]>(['sessions'], (old = []) =>
        old.map((session) => {
          if (session.id === sessionId) {
            const endTime = new Date()
            const duration = endTime.getTime() - session.startTime.getTime()
            return {
              ...session,
              endTime,
              duration,
              isCompleted,
            }
          }
          return session
        })
      )

      return { previousSessions }
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // Session 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteSessionAction,
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      const previousSessions = queryClient.getQueryData<FocusSession[]>(['sessions'])

      // Optimistic update
      queryClient.setQueryData<FocusSession[]>(['sessions'], (old = []) =>
        old.filter((session) => session.id !== sessionId)
      )

      return { previousSessions }
    },
    onError: (err, sessionId, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // 편의 함수들
  const startSession = async (
    taskId: string,
    taskTitle: string,
    mode: TimerMode,
    targetDuration?: number
  ): Promise<FocusSession> => {
    return createMutation.mutateAsync({ taskId, taskTitle, mode, targetDuration })
  }

  const endSession = (sessionId: string, isCompleted: boolean = false) => {
    return endMutation.mutateAsync({ sessionId, isCompleted })
  }

  const deleteSession = (sessionId: string) => {
    return deleteMutation.mutateAsync(sessionId)
  }

  // 쿼리 함수들
  const getSessionsByDateRange = (startDate: Date, endDate: Date): FocusSession[] => {
    return sessions.filter((session) => {
      const sessionDate = session.startTime
      return sessionDate >= startDate && sessionDate <= endDate
    })
  }

  const getSessionsByDate = (date: Date): FocusSession[] => {
    return sessions.filter((session) => {
      const sessionDate = session.startTime
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getTodaySessions = (): FocusSession[] => {
    return getSessionsByDate(new Date())
  }

  return {
    sessions,
    isLoading,
    error,
    isLoaded: !isLoading,
    isPending:
      createMutation.isPending ||
      endMutation.isPending ||
      deleteMutation.isPending,
    startSession,
    endSession,
    deleteSession,
    getSessionsByDateRange,
    getSessionsByDate,
    getTodaySessions,
  }
}
