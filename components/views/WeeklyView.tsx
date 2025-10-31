"use client";

import { FocusSession } from "@/types";
import { useState, useRef, useEffect } from "react";

interface WeeklyViewProps {
  sessions: FocusSession[];
}

export default function WeeklyView({ sessions }: WeeklyViewProps) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 (일) ~ 6 (토)
  const currentHour = now.getHours();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentHourRef = useRef<HTMLDivElement>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // 주의 Start(월요일) 구하기
  const startOfWeek = new Date(now);
  const diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
  startOfWeek.setDate(diff + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 각 요일별 Date 계산
  const weekDates = weekDays.map((_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });

  // 요일/Time별 세션 그룹핑
  const getSessionsForDayAndHour = (dayIndex: number, hour: number) => {
    const targetDate = weekDates[dayIndex].toDateString();
    return sessions.filter((session) => {
      const sessionDate = session.startTime.toDateString();
      const sessionHour = session.startTime.getHours();
      return sessionDate === targetDate && sessionHour === hour;
    });
  };

  // 현재 Time으로 자동 스크롤
  useEffect(() => {
    if (weekOffset === 0 && currentHourRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentHourRef.current;

      const elementTop = currentElement.offsetTop;
      const containerHeight = container.clientHeight;
      const scrollPosition = elementTop - containerHeight / 3;

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [weekOffset]);

  const goToPreviousWeek = () => setWeekOffset(weekOffset - 1);
  const goToNextWeek = () => setWeekOffset(weekOffset + 1);
  const goToCurrentWeek = () => setWeekOffset(0);

  return (
    <div
      ref={containerRef}
      className="overflow-auto h-full relative max-w-7xl mx-auto px-4"
    >
      {/* 헤더 + 주간 네비게이션 */}
      <div className="sticky top-0 bg-background dark:bg-background z-30 pb-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold"></h2>
        <div className="flex gap-1">
          <button
            onClick={goToCurrentWeek}
            className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          >
            현재 주
          </button>
          <button
            onClick={goToPreviousWeek}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            title="이전 주"
          >
            <svg
              className="w-4 h-4"
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
            onClick={goToNextWeek}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            title="다음 주"
          >
            <svg
              className="w-4 h-4"
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

      <div className="inline-block min-w-full">
        {/* 요일 헤더 (sticky) */}
        <div className="flex sticky top-[37px] bg-background dark:bg-background z-20 border-b-2 border-zinc-300 dark:border-zinc-700">
          <div className="w-16 flex-shrink-0" /> {/* Time 칼럼 공간 */}
          {weekDays.map((day, index) => {
            const isToday = weekOffset === 0 && (index + 1) % 7 === currentDay;
            return (
              <div
                key={day}
                className={`flex-1 min-w-[100px] text-center py-2 font-semibold ${
                  isToday
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div>{day}</div>
                <div className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  {weekDates[index].getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time대별 행 */}
        {hours.map((hour) => {
          const isCurrentHour = weekOffset === 0 && hour === currentHour;

          return (
            <div
              key={hour}
              ref={isCurrentHour ? currentHourRef : null}
              className={`flex border-b border-zinc-200 dark:border-zinc-800 ${
                isCurrentHour ? "bg-primary-50/30 dark:bg-primary-950/20" : ""
              }`}
            >
              {/* Time */}
              <div
                className={`w-16 flex-shrink-0 py-2 px-2 text-xs text-center font-mono ${
                  isCurrentHour
                    ? "text-primary-600 dark:text-primary-400 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>

              {/* 각 요일 셀 */}
              {weekDays.map((_, dayIndex) => {
                const cellSessions = getSessionsForDayAndHour(dayIndex, hour);
                const isToday =
                  weekOffset === 0 && (dayIndex + 1) % 7 === currentDay;
                const isCurrentCell = isToday && isCurrentHour;

                return (
                  <div
                    key={dayIndex}
                    className={`flex-1 min-w-[100px] p-1 min-h-[60px] relative ${
                      isToday ? "bg-primary-50/20 dark:bg-primary-950/10" : ""
                    }`}
                  >
                    {/* 현재 Time 표시 */}
                    {isCurrentCell && (
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-500 dark:bg-primary-400 z-10">
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full" />
                      </div>
                    )}

                    {cellSessions.map((session) => {
                      const durationMinutes = Math.round(
                        session.duration / 60000
                      );
                      return (
                        <div
                          key={session.id}
                          className="text-xs p-1 mb-1 rounded truncate bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700"
                          title={`${session.taskTitle}${
                            session.endTime ? ` (${durationMinutes}분)` : ""
                          }`}
                        >
                          <span className="inline-block w-1.5 h-1.5 bg-primary-500 rounded-full mr-1" />
                          {session.taskTitle}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
