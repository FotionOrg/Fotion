"use client";

import { FocusSession } from "@/types";
import { useRef, useEffect } from "react";

interface HourlyViewProps {
  sessions: FocusSession[];
}

export default function HourlyView({ sessions }: HourlyViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentHourRef = useRef<HTMLDivElement>(null);

  // 오늘 Date의 세션 + 어제 시작해서 오늘까지 이어지는 세션 필터링
  const todaySessions = sessions.filter((session) => {
    const sessionDate = session.startTime;
    const endTime = new Date(session.startTime.getTime() + session.duration);
    const today = new Date();

    // 세션이 오늘 시작했거나
    const startsToday = (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    );

    // 세션이 오늘 끝나는 경우 (어제 밤 시작)
    const endsToday = (
      endTime.getDate() === today.getDate() &&
      endTime.getMonth() === today.getMonth() &&
      endTime.getFullYear() === today.getFullYear()
    );

    return startsToday || endsToday;
  });

  // 각 Time대별로 세션 블록을 생성 (긴 세션은 여러 Time대에 걸쳐 표시)
  const getSessionBlocksForHour = (hour: number) => {
    const blocks: Array<{
      session: FocusSession;
      topPercent: number;
      heightPercent: number;
      startMinute: number;
      endMinute: number;
      isFirstBlock: boolean;
      isLastBlock: boolean;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    todaySessions.forEach((session) => {
      const startTime = session.startTime;
      const endTime = new Date(session.startTime.getTime() + session.duration);

      // 세션의 시작일과 종료일
      const sessionStartDate = new Date(startTime);
      sessionStartDate.setHours(0, 0, 0, 0);

      const sessionEndDate = new Date(endTime);
      sessionEndDate.setHours(0, 0, 0, 0);

      const todayTimestamp = today.getTime();
      const sessionStartTimestamp = sessionStartDate.getTime();
      const sessionEndTimestamp = sessionEndDate.getTime();

      // 날짜 경계를 넘어가는 세션인지 확인
      const crossesMidnight = sessionStartTimestamp !== sessionEndTimestamp;

      if (crossesMidnight) {
        // 날짜 경계를 넘는 세션 처리
        if (sessionStartTimestamp === todayTimestamp) {
          // 오늘 시작해서 내일로 넘어가는 세션 (23:xx ~ 23:59까지만 표시)
          const startHour = startTime.getHours();
          const startMinute = startTime.getMinutes();

          if (startHour === hour) {
            // 시작 시간대
            const topPercent = (startMinute / 60) * 100;
            const heightPercent = ((60 - startMinute) / 60) * 100;

            blocks.push({
              session,
              topPercent,
              heightPercent,
              startMinute,
              endMinute: 60,
              isFirstBlock: true,
              isLastBlock: false,
            });
          } else if (startHour < hour && hour <= 23) {
            // 중간 시간대 (전체 시간)
            blocks.push({
              session,
              topPercent: 0,
              heightPercent: 100,
              startMinute: 0,
              endMinute: 60,
              isFirstBlock: false,
              isLastBlock: false,
            });
          }
        } else if (sessionEndTimestamp === todayTimestamp) {
          // 어제 밤 시작해서 오늘 새벽까지 이어지는 세션 (00:00 ~ 종료시간까지만 표시)
          const endHour = endTime.getHours();
          const endMinute = endTime.getMinutes();

          if (hour === 0 || hour < endHour) {
            // 0시부터 종료 시간 전까지의 시간대 (전체 시간)
            blocks.push({
              session,
              topPercent: 0,
              heightPercent: 100,
              startMinute: 0,
              endMinute: 60,
              isFirstBlock: hour === 0,
              isLastBlock: false,
            });
          } else if (hour === endHour) {
            // 종료 시간대
            const heightPercent = (endMinute / 60) * 100;

            blocks.push({
              session,
              topPercent: 0,
              heightPercent,
              startMinute: 0,
              endMinute,
              isFirstBlock: false,
              isLastBlock: true,
            });
          }
        }
      } else {
        // 같은 날 내에서 시작하고 끝나는 세션 (기존 로직)
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();

        // 이 Time대에 세션이 걸쳐있는지 확인
        if (startHour <= hour && endHour >= hour) {
          let blockStartMinute = 0;
          let blockEndMinute = 60;
          let isFirstBlock = false;
          let isLastBlock = false;

          if (startHour === hour) {
            // Start Time대
            blockStartMinute = startMinute;
            isFirstBlock = true;
          }

          if (endHour === hour) {
            // End Time대
            blockEndMinute = endMinute;
            isLastBlock = true;
          }

          const topPercent = (blockStartMinute / 60) * 100;
          const heightPercent = ((blockEndMinute - blockStartMinute) / 60) * 100;

          blocks.push({
            session,
            topPercent,
            heightPercent,
            startMinute: blockStartMinute,
            endMinute: blockEndMinute,
            isFirstBlock,
            isLastBlock,
          });
        }
      }
    });

    return blocks;
  };

  // 컴포넌트 마운트 시 현재 Time대로 스크롤
  useEffect(() => {
    if (currentHourRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentHourRef.current;

      // 현재 Time 요소의 위치 계산
      const elementTop = currentElement.offsetTop;
      const containerHeight = container.clientHeight;
      const scrollPosition = elementTop - containerHeight / 3; // 화면 1/3 지점에 현재 Time 배치

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="relative h-full">
      {/* 상단 블러 효과 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background dark:from-background to-transparent pointer-events-none z-20" />

      {/* 하단 블러 효과 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background dark:from-background to-transparent pointer-events-none z-20" />

      <div
        ref={containerRef}
        className="overflow-auto h-full max-w-7xl mx-auto px-4"
      >
        <div className="space-y-8">
          {hours.map((hour) => {
            // 해당 Time대의 세션 블록들 가져오기
            const sessionBlocks = getSessionBlocksForHour(hour);
            const isCurrentHour = hour === currentHour;

            return (
              <div
                key={hour}
                ref={isCurrentHour ? currentHourRef : null}
                className={`relative flex gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 min-h-[80px] ${
                  isCurrentHour
                    ? "bg-primary-50/30 dark:bg-primary-950/20 rounded-lg p-3 -mx-3"
                    : ""
                }`}
              >
                <div
                  className={`w-16 text-sm font-mono ${
                    isCurrentHour
                      ? "text-primary-600 dark:text-primary-400 font-semibold"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 relative">
                  {/* 현재 Time 막대 */}
                  {isCurrentHour && (
                    <div
                      className="absolute left-0 right-0 h-0.5 bg-primary-500 dark:bg-primary-400 z-20 shadow-sm"
                      style={{
                        top: `${(currentMinute / 60) * 100}%`,
                      }}
                    >
                      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-primary-500 dark:bg-primary-400 rounded-full" />
                    </div>
                  )}

                  {sessionBlocks.length > 0 ? (
                    sessionBlocks.map((block) => {
                      const durationMinutes = Math.round(
                        block.session.duration / 60000
                      );

                      return (
                        <div
                          key={`${block.session.id}-${hour}`}
                          className={`absolute left-0 right-0 p-3 text-sm border bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 shadow-sm ${
                            block.isFirstBlock && block.isLastBlock
                              ? "rounded-lg"
                              : block.isFirstBlock
                              ? "rounded-t-lg"
                              : block.isLastBlock
                              ? "rounded-b-lg"
                              : ""
                          }`}
                          style={{
                            top: `${block.topPercent}%`,
                            height: `${block.heightPercent}%`,
                            minHeight: "40px",
                          }}
                        >
                          <div className="flex flex-col gap-1 h-full">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                                <span className="font-medium truncate">
                                  {block.session.taskTitle}
                                </span>
                              </div>
                            </div>
                            {/* 시간 정보 표시 */}
                            {block.isFirstBlock && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {block.session.startTime
                                  .getHours()
                                  .toString()
                                  .padStart(2, "0")}
                                :
                                {block.session.startTime
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0")}
                                {block.session.endTime &&
                                  ` - ${block.session.endTime
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:${block.session.endTime
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0")}`}
                                {block.session.endTime &&
                                  ` (${durationMinutes}분)`}
                              </div>
                            )}
                            {/* 날짜 경계를 넘는 세션의 경우 0시 블록에 시간 정보 표시 */}
                            {!block.isFirstBlock && hour === 0 && block.session.endTime && (() => {
                              const startTime = block.session.startTime;
                              const endTime = block.session.endTime;
                              const startDate = new Date(startTime);
                              startDate.setHours(0, 0, 0, 0);
                              const endDate = new Date(endTime);
                              endDate.setHours(0, 0, 0, 0);

                              // 어제 시작해서 오늘 끝나는 세션
                              if (startDate.getTime() !== endDate.getTime()) {
                                return (
                                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                    00:00 - {endTime
                                      .getHours()
                                      .toString()
                                      .padStart(2, "0")}:{endTime
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, "0")} (전날부터 계속)
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-300 dark:text-zinc-700 text-sm">
                      -
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
