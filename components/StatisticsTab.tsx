'use client'

import { memo, useMemo } from 'react'
import { FocusSession } from '@/types'
import MonthlyView from './views/MonthlyView'

interface StatisticsTabProps {
  sessions: FocusSession[]
}

function StatisticsTab({ sessions }: StatisticsTabProps) {
  // 통계 계산
  const statistics = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 오늘 세션
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime.getFullYear(), s.startTime.getMonth(), s.startTime.getDate())
      return sessionDate.getTime() === today.getTime()
    })

    // 이번 주 세션
    const thisWeekSessions = sessions.filter(s => s.startTime >= thisWeekStart)

    // 이번 달 세션
    const thisMonthSessions = sessions.filter(s => s.startTime >= thisMonthStart)

    // 완료된 세션
    const completedSessions = sessions.filter(s => s.completed)

    // 시간 계산 (분 단위)
    const calculateTotalMinutes = (sessions: FocusSession[]) => {
      return sessions.reduce((total, s) => total + Math.round(s.duration / 60000), 0)
    }

    const todayMinutes = calculateTotalMinutes(todaySessions)
    const weekMinutes = calculateTotalMinutes(thisWeekSessions)
    const monthMinutes = calculateTotalMinutes(thisMonthSessions)
    const totalMinutes = calculateTotalMinutes(sessions)

    // 평균 집중 시간
    const avgSessionMinutes = sessions.length > 0
      ? Math.round(totalMinutes / sessions.length)
      : 0

    // 완료율
    const completionRate = sessions.length > 0
      ? Math.round((completedSessions.length / sessions.length) * 100)
      : 0

    return {
      todayMinutes,
      weekMinutes,
      monthMinutes,
      totalMinutes,
      todaySessions: todaySessions.length,
      weekSessions: thisWeekSessions.length,
      monthSessions: thisMonthSessions.length,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      avgSessionMinutes,
      completionRate,
    }
  }, [sessions])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  return (
    <div className="flex flex-col h-full">
      {/* 통계 카드 */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-surface dark:bg-surface overflow-x-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-max">
          {/* 오늘 */}
          <StatCard
            title="오늘"
            value={formatTime(statistics.todayMinutes)}
            subtitle={`${statistics.todaySessions}회 집중`}
            icon="📅"
          />

          {/* 이번 주 */}
          <StatCard
            title="이번 주"
            value={formatTime(statistics.weekMinutes)}
            subtitle={`${statistics.weekSessions}회 집중`}
            icon="📊"
          />

          {/* 이번 달 */}
          <StatCard
            title="이번 달"
            value={formatTime(statistics.monthMinutes)}
            subtitle={`${statistics.monthSessions}회 집중`}
            icon="📈"
          />

          {/* 전체 */}
          <StatCard
            title="전체"
            value={formatTime(statistics.totalMinutes)}
            subtitle={`${statistics.totalSessions}회 집중`}
            icon="🎯"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 min-w-max">
          {/* 평균 집중 시간 */}
          <StatCard
            title="평균 집중 시간"
            value={formatTime(statistics.avgSessionMinutes)}
            subtitle="세션당"
            icon="⏱️"
            small
          />

          {/* 완료율 */}
          <StatCard
            title="완료율"
            value={`${statistics.completionRate}%`}
            subtitle={`${statistics.completedSessions}/${statistics.totalSessions} 완료`}
            icon="✅"
            small
          />

          {/* 최장 스트릭 (추후 구현) */}
          <StatCard
            title="최장 연속"
            value="-"
            subtitle="연속 집중일"
            icon="🔥"
            small
          />
        </div>
      </div>

      {/* 월간 캘린더 */}
      <div className="flex-1 overflow-hidden">
        <MonthlyView sessions={sessions} />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: string
  small?: boolean
}

function StatCard({ title, value, subtitle, icon, small = false }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <span className={small ? "text-lg" : "text-2xl"}>{icon}</span>
      </div>
      <div className={`font-bold text-foreground ${small ? 'text-xl' : 'text-2xl'}`}>
        {value}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        {subtitle}
      </div>
    </div>
  )
}

export default memo(StatisticsTab)
