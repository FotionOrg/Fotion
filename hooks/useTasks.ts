'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Task } from '@/types'
import {
  getTasksAction,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from '@/app/actions/tasks'

/**
 * React Query를 사용하는 Tasks hook
 * - 자동 캐싱 및 refetching
 * - Optimistic updates
 * - 캐시 무효화
 */
export function useTasks() {
  const queryClient = useQueryClient()

  // Tasks 조회 (자동 캐싱)
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasksAction,
  })

  // Task 생성
  const createMutation = useMutation({
    mutationFn: createTaskAction,
    onMutate: async (newTaskData) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // 이전 데이터 백업
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      // Optimistic update
      const optimisticTask: Task = {
        ...newTaskData,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      queryClient.setQueryData<Task[]>(['tasks'], (old = []) => [...old, optimisticTask])

      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // 에러 발생 시 롤백
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      // 완료 후 refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Task 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTaskAction(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      // Optimistic update
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((task) =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        )
      )

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Task 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteTaskAction,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      // Optimistic update
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.filter((task) => task.id !== taskId)
      )

      return { previousTasks }
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // 편의 함수들
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(taskData)
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    return updateMutation.mutateAsync({ id: taskId, updates })
  }

  const deleteTask = (taskId: string) => {
    return deleteMutation.mutateAsync(taskId)
  }

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    return updateTask(taskId, { status })
  }

  return {
    tasks,
    isLoading,
    error,
    isLoaded: !isLoading,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  }
}
