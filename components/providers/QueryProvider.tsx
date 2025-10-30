'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
            gcTime: 1000 * 60 * 30, // 30분 후 가비지 컬렉션
            refetchOnWindowFocus: true, // 창 포커스 시 자동 refetch
            refetchOnReconnect: true, // 재연결 시 자동 refetch
            retry: 1, // 실패 시 1번만 재시도
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
