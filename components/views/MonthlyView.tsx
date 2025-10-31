"use client";

import { FocusSession } from "@/types";
import { useState } from "react";

interface MonthlyViewProps {
  sessions: FocusSession[];
}

export default function MonthlyView({ sessions }: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 해당 월의 첫날과 마지막날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 캘린더 Start일 (이전 달 Date 포함)
  const startDay = new Date(firstDay);
  startDay.setDate(startDay.getDate() - ((firstDay.getDay() + 6) % 7)); // 월요일부터 Start

  // 6주치 Date 생성
  const calendarDays: Date[] = [];
  const currentDay = new Date(startDay);
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // 특정 Date의 세션 개수 계산
  const getSessionCountForDate = (date: Date) => {
    const dateString = date.toDateString();
    return sessions.filter((session) => {
      return session.startTime.toDateString() === dateString;
    }).length;
  };

  // 이전/다음 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {year}년 {month + 1}월
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          >
            오늘
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
        {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
          <div
            key={day}
            className={`text-center py-2 text-sm font-semibold bg-surface dark:bg-surface ${
              index >= 5
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date 그리드 */}
      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === today.toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const sessionCount = getSessionCountForDate(date);

          return (
            <div
              key={index}
              className={`min-h-[80px] p-2 bg-surface dark:bg-surface hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors cursor-pointer relative ${
                !isCurrentMonth ? "opacity-40" : ""
              }`}
            >
              {/* Date 숫자 */}
              <div
                className={`text-sm font-medium ${
                  isToday
                    ? "flex items-center justify-center w-7 h-7 bg-primary-600 text-white rounded-full"
                    : isWeekend
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {date.getDate()}
              </div>

              {/* Session 표시 */}
              {sessionCount > 0 && (
                <div className="mt-1">
                  {sessionCount <= 3 ? (
                    // 3개 이하: 점으로 표시
                    <div className="flex gap-1">
                      {Array.from({ length: sessionCount }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-primary-500 dark:bg-primary-400 rounded-full"
                        />
                      ))}
                    </div>
                  ) : (
                    // 4개 이상: 숫자로 표시
                    <div className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                      {sessionCount}
                    </div>
                  )}
                </div>
              )}

              {/* Session 밀도에 따른 배경 Color */}
              {sessionCount > 0 && (
                <div
                  className="absolute inset-0 bg-primary-500 dark:bg-primary-600 pointer-events-none"
                  style={{
                    opacity: Math.min(sessionCount * 0.05, 0.2),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
