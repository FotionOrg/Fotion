"use client";

import { FocusSession } from "@/types";
import { useRef, useEffect, useState } from "react";

interface WeeklyViewCanvasProps {
  sessions: FocusSession[];
  onSessionClick?: (session: FocusSession) => void;
}

const HOUR_HEIGHT = 40; // 각 시간대의 높이 (px)
const LEFT_MARGIN = 60; // 시간 레이블 영역 너비
const TOP_MARGIN = 80; // 상단 여백 (요일 헤더 포함)
const BOTTOM_MARGIN = 40; // 하단 여백
const MIN_BLOCK_HEIGHT = 24; // 최소 블록 높이 (텍스트가 들어갈 수 있는 크기)

export default function WeeklyViewCanvas({ sessions, onSessionClick }: WeeklyViewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = 이번 주, -1 = 지난 주, 1 = 다음 주
  const sessionBlocksRef = useRef<Array<{
    session: FocusSession;
    x: number;
    y: number;
    width: number;
    height: number;
  }>>([]);

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0(일) ~ 6(토)

  // 주간 범위 계산 (weekOffset 고려)
  const getWeekRange = (offset: number) => {
    const today = new Date();
    const day = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day + offset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(weekOffset);

  // 이번 주의 세션만 필터링
  const weekSessions = sessions.filter((session) => {
    return session.startTime >= startOfWeek && session.startTime <= endOfWeek;
  });

  // 요일 이름
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 다크 모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 동적으로 요일 너비 계산
  const getDayWidth = (containerWidth: number) => {
    return Math.floor((containerWidth - LEFT_MARGIN) / 7);
  };

  // Canvas 크기 설정
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = 24 * HOUR_HEIGHT + TOP_MARGIN + BOTTOM_MARGIN;
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Canvas 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DAY_WIDTH = getDayWidth(canvasSize.width);

    // High DPI 지원
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);

    // 배경 초기화
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // 색상 정의
    const colors = isDarkMode
      ? {
          background: "#09090b",
          border: "#27272a",
          borderLight: "#18181b",
          text: "#a1a1aa",
          textHighlight: "#60a5fa",
          todayBg: "#1e3a8a20",
          currentTimeLine: "#60a5fa",
          sessionBg: "#1e3a8a40",
          sessionBorder: "#1e40af",
          sessionText: "#e4e4e7",
          headerBg: "#18181b",
        }
      : {
          background: "#ffffff",
          border: "#e4e4e7",
          borderLight: "#f4f4f5",
          text: "#71717a",
          textHighlight: "#2563eb",
          todayBg: "#dbeafe30",
          currentTimeLine: "#3b82f6",
          sessionBg: "#eff6ff",
          sessionBorder: "#bfdbfe",
          sessionText: "#1e293b",
          headerBg: "#fafafa",
        };

    // 요일 헤더 배경
    ctx.fillStyle = colors.headerBg;
    ctx.fillRect(0, 0, canvasSize.width, TOP_MARGIN - 20);

    // 요일 헤더 그리기
    for (let day = 0; day < 7; day++) {
      const x = LEFT_MARGIN + day * DAY_WIDTH;
      const isToday = day === currentDay && weekOffset === 0;

      // 오늘 날짜 배경 (이번 주일 때만)
      if (isToday) {
        ctx.fillStyle = colors.todayBg;
        ctx.fillRect(x, 0, DAY_WIDTH, canvasSize.height);
      }

      // 요일 이름
      ctx.fillStyle = isToday ? colors.textHighlight : colors.text;
      ctx.font = isToday ? "700 16px sans-serif" : "600 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dayNames[day], x + DAY_WIDTH / 2, 30);

      // 날짜
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + day);
      ctx.font = "400 12px sans-serif";
      ctx.fillStyle = colors.text;
      ctx.fillText(
        `${date.getMonth() + 1}/${date.getDate()}`,
        x + DAY_WIDTH / 2,
        50
      );

      // 세로 구분선
      if (day > 0) {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, TOP_MARGIN - 20);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
    }

    // 시간별 그리드 그리기
    for (let hour = 0; hour < 24; hour++) {
      const y = TOP_MARGIN + hour * HOUR_HEIGHT;

      // 가로 구분선
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LEFT_MARGIN, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();

      // 시간 레이블 (1시간마다)
      ctx.fillStyle = colors.text;
      ctx.font = "400 11px monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(
        `${hour.toString().padStart(2, "0")}:00`,
        LEFT_MARGIN - 8,
        y + 4
      );
    }

    // 겹치는 세션 감지 및 컬럼 배치 (요일별로)
    interface SessionWithLayout extends FocusSession {
      column: number;
      totalColumns: number;
    }

    const sessionsWithLayout: SessionWithLayout[] = weekSessions.map((session) => ({
      ...session,
      column: 0,
      totalColumns: 1,
    }));

    // 시작 시간 순으로 정렬
    sessionsWithLayout.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // UI상 겹침 감지 함수 (같은 날짜 내에서만, 최소 블록 높이 고려)
    const isOverlappingUI = (session1: FocusSession, session2: FocusSession) => {
      // 다른 요일이면 겹치지 않음
      if (session1.startTime.getDay() !== session2.startTime.getDay()) {
        return false;
      }

      const startHour1 = session1.startTime.getHours();
      const startMinute1 = session1.startTime.getMinutes();
      const startY1 = TOP_MARGIN + startHour1 * HOUR_HEIGHT + (startMinute1 / 60) * HOUR_HEIGHT;

      const startHour2 = session2.startTime.getHours();
      const startMinute2 = session2.startTime.getMinutes();
      const startY2 = TOP_MARGIN + startHour2 * HOUR_HEIGHT + (startMinute2 / 60) * HOUR_HEIGHT;

      // 실제 블록 높이 계산 (최소 높이 적용)
      const calculatedHeight1 = (session1.duration / 60000 / 60) * HOUR_HEIGHT;
      const blockHeight1 = Math.max(calculatedHeight1, MIN_BLOCK_HEIGHT);
      const endY1 = startY1 + blockHeight1;

      const calculatedHeight2 = (session2.duration / 60000 / 60) * HOUR_HEIGHT;
      const blockHeight2 = Math.max(calculatedHeight2, MIN_BLOCK_HEIGHT);
      const endY2 = startY2 + blockHeight2;

      // UI상 Y 좌표가 겹치는지 확인
      return startY1 < endY2 && startY2 < endY1;
    };

    // 요일별로 그룹화
    const sessionsByDay: { [key: number]: SessionWithLayout[] } = {};
    for (let day = 0; day < 7; day++) {
      sessionsByDay[day] = sessionsWithLayout.filter(s => s.startTime.getDay() === day);
    }

    // 각 요일별로 컬럼 배치
    for (let day = 0; day < 7; day++) {
      const daySessions = sessionsByDay[day];
      if (daySessions.length === 0) continue;

      // 겹치는 그룹 찾기
      const overlappingGroups: SessionWithLayout[][] = [];
      const processed = new Set<SessionWithLayout>();

      for (const session of daySessions) {
        if (processed.has(session)) continue;

        // 이 세션과 겹치는 모든 세션 찾기
        const group: SessionWithLayout[] = [session];
        processed.add(session);

        for (const other of daySessions) {
          if (processed.has(other)) continue;

          // 그룹 내 어떤 세션과라도 겹치면 그룹에 추가
          if (group.some(g => isOverlappingUI(g, other))) {
            group.push(other);
            processed.add(other);
          }
        }

        overlappingGroups.push(group);
      }

      // 각 그룹 내에서 컬럼 배치
      for (const group of overlappingGroups) {
        if (group.length === 1) continue;

        // 시작 시간 순으로 정렬
        group.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        // 각 컬럼의 마지막 종료 시간 추적
        const columnEndTimes: number[] = [];

        for (const session of group) {
          // UI상 Y 좌표 계산
          const startHour = session.startTime.getHours();
          const startMinute = session.startTime.getMinutes();
          const startY = TOP_MARGIN + startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
          const calculatedHeight = (session.duration / 60000 / 60) * HOUR_HEIGHT;
          const blockHeight = Math.max(calculatedHeight, MIN_BLOCK_HEIGHT);
          const endY = startY + blockHeight;

          // 사용 가능한 컬럼 찾기 (UI상 Y 좌표 기준)
          let column = 0;
          while (column < columnEndTimes.length && columnEndTimes[column] > startY) {
            column++;
          }

          session.column = column;

          // 컬럼 종료 Y 좌표 업데이트
          if (column < columnEndTimes.length) {
            columnEndTimes[column] = endY;
          } else {
            columnEndTimes.push(endY);
          }
        }

        // 그룹 내 모든 세션의 totalColumns 업데이트
        const totalColumns = columnEndTimes.length;
        group.forEach(s => s.totalColumns = totalColumns);
      }
    }

    // 블록 위치 정보 저장용 배열
    const blocks: Array<{
      session: FocusSession;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    // 세션 블록 그리기
    sessionsWithLayout.forEach((session) => {
      const sessionDay = session.startTime.getDay();
      const startHour = session.startTime.getHours();
      const startMinute = session.startTime.getMinutes();
      const durationMs = session.duration;
      const endTime = new Date(session.startTime.getTime() + durationMs);
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();

      // X 위치 계산 (요일 + 컬럼 위치 반영)
      const dayStartX = LEFT_MARGIN + sessionDay * DAY_WIDTH;
      const availableWidth = DAY_WIDTH - 8;
      const columnWidth = availableWidth / session.totalColumns;
      const columnGap = 2; // 컬럼 간 간격

      const blockX = dayStartX + 4 + session.column * columnWidth;
      const blockWidth = columnWidth - columnGap;

      // Y 위치 계산 (시간)
      const startY =
        TOP_MARGIN + startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;

      // 높이 계산
      const totalMinutes = Math.round(durationMs / 60000);
      const calculatedHeight = (totalMinutes / 60) * HOUR_HEIGHT;
      const blockHeight = Math.max(calculatedHeight, MIN_BLOCK_HEIGHT);

      // 블록 위치 정보 저장
      blocks.push({
        session,
        x: blockX,
        y: startY,
        width: blockWidth,
        height: blockHeight,
      });

      // 블록 그리기
      ctx.fillStyle = colors.sessionBg;
      ctx.strokeStyle = colors.sessionBorder;
      ctx.lineWidth = 2;

      // 둥근 모서리 사각형
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(blockX + radius, startY);
      ctx.lineTo(blockX + blockWidth - radius, startY);
      ctx.quadraticCurveTo(
        blockX + blockWidth,
        startY,
        blockX + blockWidth,
        startY + radius
      );
      ctx.lineTo(blockX + blockWidth, startY + blockHeight - radius);
      ctx.quadraticCurveTo(
        blockX + blockWidth,
        startY + blockHeight,
        blockX + blockWidth - radius,
        startY + blockHeight
      );
      ctx.lineTo(blockX + radius, startY + blockHeight);
      ctx.quadraticCurveTo(
        blockX,
        startY + blockHeight,
        blockX,
        startY + blockHeight - radius
      );
      ctx.lineTo(blockX, startY + radius);
      ctx.quadraticCurveTo(blockX, startY, blockX + radius, startY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 텍스트 표시 (블록 높이에 따라 조정)
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      if (blockHeight >= 40) {
        // 충분한 높이: 제목 + 시간 표시
        ctx.fillStyle = colors.sessionText;
        ctx.font = "600 11px sans-serif";
        ctx.save();
        ctx.beginPath();
        ctx.rect(blockX + 4, startY + 4, blockWidth - 8, blockHeight - 8);
        ctx.clip();
        ctx.fillText(session.taskTitle, blockX + 6, startY + 6);
        ctx.restore();

        const timeText = `${startHour.toString().padStart(2, "0")}:${startMinute
          .toString()
          .padStart(2, "0")}`;
        ctx.fillStyle = colors.text;
        ctx.font = "400 10px sans-serif";
        ctx.fillText(timeText, blockX + 6, startY + 22);
      } else if (blockHeight >= MIN_BLOCK_HEIGHT) {
        // 최소 높이: 제목만 표시 (작은 폰트)
        ctx.fillStyle = colors.sessionText;
        ctx.font = "600 9px sans-serif";
        ctx.save();
        ctx.beginPath();
        ctx.rect(blockX + 4, startY + 2, blockWidth - 8, blockHeight - 4);
        ctx.clip();
        ctx.fillText(session.taskTitle, blockX + 6, startY + 4);
        ctx.restore();
      }
      // blockHeight < MIN_BLOCK_HEIGHT: 텍스트 표시 안함 (블록만 표시)
    });

    // 현재 시간 막대 (이번 주일 때만)
    if (weekOffset === 0) {
      const todayX = LEFT_MARGIN + currentDay * DAY_WIDTH;
      const currentY =
        TOP_MARGIN +
        currentHour * HOUR_HEIGHT +
        (now.getMinutes() / 60) * HOUR_HEIGHT;

      ctx.strokeStyle = colors.currentTimeLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(todayX, currentY);
      ctx.lineTo(todayX + DAY_WIDTH, currentY);
      ctx.stroke();

      // 현재 시간 원
      ctx.fillStyle = colors.currentTimeLine;
      ctx.beginPath();
      ctx.arc(todayX + 4, currentY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 블록 정보를 ref에 저장
    sessionBlocksRef.current = blocks;
  }, [
    canvasSize,
    weekSessions,
    currentHour,
    currentDay,
    isDarkMode,
    startOfWeek,
    weekOffset,
  ]);

  // Canvas 클릭 핸들러
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSessionClick || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Canvas 좌표 계산
    // clientY는 viewport 기준이고, rect.top은 canvas의 viewport 상단 위치
    // canvas 내부 좌표를 얻으려면 빼기만 하면 됨
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('WeeklyView - Click coords:', { x, y, scrollTop: containerRef.current.scrollTop });
    console.log('WeeklyView - Total blocks:', sessionBlocksRef.current.length);

    // 클릭된 블록 찾기 (역순으로 검색하여 가장 위의 블록 우선)
    let found = false;
    for (let i = sessionBlocksRef.current.length - 1; i >= 0; i--) {
      const block = sessionBlocksRef.current[i];
      const inX = x >= block.x && x <= block.x + block.width;
      const inY = y >= block.y && y <= block.y + block.height;

      console.log(`Block ${i} "${block.session.taskTitle}":`, {
        blockRange: `x:${block.x}-${block.x + block.width}, y:${block.y}-${block.y + block.height}`,
        clickInX: inX,
        clickInY: inY,
        match: inX && inY
      });

      if (inX && inY) {
        console.log('✓ WeeklyView - Clicked block:', block.session.taskTitle);
        onSessionClick(block.session);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('✗ No block matched the click coordinates');
    }
  };

  // 현재 시간으로 스크롤
  useEffect(() => {
    if (containerRef.current && canvasSize.height > 0) {
      const currentY = TOP_MARGIN + currentHour * HOUR_HEIGHT;
      const containerHeight = containerRef.current.clientHeight;
      const scrollPosition = currentY - containerHeight / 3;

      // 약간 지연 후 스크롤 (렌더링 완료 대기)
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      }, 100);
    }
  }, [canvasSize.height, currentHour]);

  // 주간 제목 포맷
  const getWeekTitle = () => {
    const start = new Date(startOfWeek);
    const end = new Date(endOfWeek);

    if (weekOffset === 0) {
      return "이번 주";
    }

    return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* 하단 블러 효과 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background dark:from-background to-transparent pointer-events-none z-20" />

      <div
        ref={containerRef}
        className="overflow-y-auto overflow-x-hidden h-full"
      >
        <div className="sticky top-0 bg-background dark:bg-background z-10 py-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-center">
            {/* 주간 네비게이션 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="이전 주"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
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

              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[140px] text-center">
                {getWeekTitle()}
              </span>

              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="다음 주"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
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

              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="ml-2 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  오늘
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="w-full">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-pointer"
            onClick={handleCanvasClick}
          />
        </div>
      </div>
    </div>
  );
}
