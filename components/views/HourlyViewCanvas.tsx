"use client";

import { FocusSession, Task } from "@/types";
import { useRef, useEffect, useState } from "react";
import { getTaskColor } from "@/lib/colors";

interface HourlyViewCanvasProps {
  sessions: FocusSession[];
  tasks: Task[];
  onSessionClick?: (session: FocusSession) => void;
}

const HOUR_HEIGHT = 120; // 각 Time대의 높이 (px)
const LEFT_MARGIN = 80; // Time 레이블 영역 너비
const TOP_MARGIN = 60; // 상단 여백
const BOTTOM_MARGIN = 40; // 하단 여백
const MIN_BLOCK_HEIGHT = 30; // 최소 블록 높이 (텍스트가 들어갈 수 있는 크기)

export default function HourlyViewCanvas({
  sessions,
  tasks,
  onSessionClick,
}: HourlyViewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const sessionBlocksRef = useRef<
    Array<{
      session: FocusSession;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  >([]);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 오늘 Date의 세션만 필터링
  const todaySessions = sessions.filter((session) => {
    const sessionDate = session.startTime;
    const today = new Date();
    return (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    );
  });

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

  // Canvas 크기 Settings
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

    // High DPI 지원
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);

    // 배경 초기화
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Color 정의
    const colors = isDarkMode
      ? {
          background: "#09090b",
          border: "#27272a",
          text: "#a1a1aa",
          textHighlight: "#60a5fa",
          currentHourBg: "#1e3a8a20",
          currentTimeLine: "#60a5fa",
          sessionBg: "#1e3a8a40",
          sessionBorder: "#1e40af",
          sessionText: "#e4e4e7",
        }
      : {
          background: "#ffffff",
          border: "#e4e4e7",
          text: "#71717a",
          textHighlight: "#2563eb",
          currentHourBg: "#dbeafe30",
          currentTimeLine: "#3b82f6",
          sessionBg: "#eff6ff",
          sessionBorder: "#bfdbfe",
          sessionText: "#1e293b",
        };

    // Time별 그리드 그리기
    for (let hour = 0; hour < 24; hour++) {
      const y = TOP_MARGIN + hour * HOUR_HEIGHT;
      const isCurrentHour = hour === currentHour;

      // 현재 Time대 배경
      if (isCurrentHour) {
        ctx.fillStyle = colors.currentHourBg;
        ctx.fillRect(0, y, canvasSize.width, HOUR_HEIGHT);
      }

      // 구분선
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LEFT_MARGIN, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();

      // Time 레이블
      ctx.fillStyle = isCurrentHour ? colors.textHighlight : colors.text;
      ctx.font = isCurrentHour ? "600 14px monospace" : "400 14px monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(
        `${hour.toString().padStart(2, "0")}:00`,
        LEFT_MARGIN - 16,
        y + 8
      );
    }

    // 겹치는 세션 감지 및 컬럼 배치
    interface SessionWithLayout extends FocusSession {
      column: number;
      totalColumns: number;
    }

    const sessionsWithLayout: SessionWithLayout[] = todaySessions.map(
      (session) => ({
        ...session,
        column: 0,
        totalColumns: 1,
      })
    );

    // Start Time 순으로 정렬
    sessionsWithLayout.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    // UI상 겹침 감지 함수 (실제 Time + 최소 블록 높이 고려)
    const isOverlappingUI = (
      session1: FocusSession,
      session2: FocusSession
    ) => {
      const startHour1 = session1.startTime.getHours();
      const startMinute1 = session1.startTime.getMinutes();
      const startY1 =
        TOP_MARGIN +
        startHour1 * HOUR_HEIGHT +
        (startMinute1 / 60) * HOUR_HEIGHT;

      const startHour2 = session2.startTime.getHours();
      const startMinute2 = session2.startTime.getMinutes();
      const startY2 =
        TOP_MARGIN +
        startHour2 * HOUR_HEIGHT +
        (startMinute2 / 60) * HOUR_HEIGHT;

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

    // 겹치는 그룹 찾기
    const overlappingGroups: SessionWithLayout[][] = [];
    const processed = new Set<SessionWithLayout>();

    for (const session of sessionsWithLayout) {
      if (processed.has(session)) continue;

      // 이 세션과 겹치는 모든 세션 찾기
      const group: SessionWithLayout[] = [session];
      processed.add(session);

      for (const other of sessionsWithLayout) {
        if (processed.has(other)) continue;

        // 그룹 내 어떤 세션과라도 겹치면 그룹에 추가
        const overlaps = group.some((g) => isOverlappingUI(g, other));
        if (overlaps) {
          group.push(other);
          processed.add(other);
        }
      }

      overlappingGroups.push(group);
    }

    // 각 그룹 내에서 컬럼 배치
    for (const group of overlappingGroups) {
      if (group.length === 1) continue;

      // Start Time 순으로 정렬
      group.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      // 각 컬럼의 마지막 End Time 추적
      const columnEndTimes: number[] = [];

      for (const session of group) {
        // UI상 Y 좌표 계산
        const startHour = session.startTime.getHours();
        const startMinute = session.startTime.getMinutes();
        const startY =
          TOP_MARGIN +
          startHour * HOUR_HEIGHT +
          (startMinute / 60) * HOUR_HEIGHT;
        const calculatedHeight = (session.duration / 60000 / 60) * HOUR_HEIGHT;
        const blockHeight = Math.max(calculatedHeight, MIN_BLOCK_HEIGHT);
        const endY = startY + blockHeight;

        // 사용 가능한 컬럼 찾기 (UI상 Y 좌표 기준)
        let column = 0;
        while (
          column < columnEndTimes.length &&
          columnEndTimes[column] > startY
        ) {
          column++;
        }

        session.column = column;

        // 컬럼 End Y 좌표 업데이트
        if (column < columnEndTimes.length) {
          columnEndTimes[column] = endY;
        } else {
          columnEndTimes.push(endY);
        }
      }

      // 그룹 내 모든 세션의 totalColumns 업데이트
      const totalColumns = columnEndTimes.length;
      group.forEach((s) => (s.totalColumns = totalColumns));
    }

    // 블록 위치 정보 Save용 배열
    const blocks: Array<{
      session: FocusSession;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    // 세션 블록 그리기
    sessionsWithLayout.forEach((session) => {
      const startHour = session.startTime.getHours();
      const startMinute = session.startTime.getMinutes();
      const durationMs = session.duration;
      const endTime = new Date(session.startTime.getTime() + durationMs);
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();

      // Start Y 위치 계산
      const startY =
        TOP_MARGIN + startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;

      // 높이 계산 (여러 Time대에 걸칠 수 있음)
      const totalMinutes = Math.round(durationMs / 60000);
      const calculatedHeight = (totalMinutes / 60) * HOUR_HEIGHT;
      const blockHeight = Math.max(calculatedHeight, MIN_BLOCK_HEIGHT);

      // 블록 그리기 (컬럼 위치 반영)
      const totalAvailableWidth = canvasSize.width - LEFT_MARGIN - 16;
      const columnWidth = totalAvailableWidth / session.totalColumns;
      const columnGap = 4; // 컬럼 간 간격

      const blockX = LEFT_MARGIN + 8 + session.column * columnWidth;
      const blockWidth = columnWidth - columnGap;

      // 블록 위치 정보 Save
      blocks.push({
        session,
        x: blockX,
        y: startY,
        width: blockWidth,
        height: blockHeight,
      });

      // Task 색상 가져오기
      const task = tasks.find((t) => t.id === session.taskId);
      const taskColor = getTaskColor(task?.color);

      // 배경색 및 테두리색 (task 색상 사용)
      if (taskColor) {
        // Task에 색상이 지정된 경우
        // 배경: 밝은 색상 (hex value에서 투명도 적용)
        const hexColor = taskColor.value;
        ctx.fillStyle = isDarkMode
          ? `${hexColor}30` // 어두운 모드: 불투명도 18% (30 in hex)
          : `${hexColor}20`; // 밝은 모드: 불투명도 12% (20 in hex)
        ctx.strokeStyle = taskColor.value; // 테두리: 원색
      } else {
        // 기본 색상
        ctx.fillStyle = colors.sessionBg;
        ctx.strokeStyle = colors.sessionBorder;
      }
      ctx.lineWidth = 2;

      // 둥근 모서리 사각형
      const radius = 8;
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

      // 텍스트 표시 (한 줄로만 표시)
      ctx.fillStyle = colors.sessionText;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      if (blockHeight >= 20) {
        // Title만 한 줄로 표시
        ctx.font = "600 13px sans-serif";

        // 텍스트가 블록을 넘어가지 않도록 클리핑
        ctx.save();
        ctx.beginPath();
        ctx.rect(blockX + 12, startY, blockWidth - 24, blockHeight);
        ctx.clip();

        // 블록 중앙에 텍스트 표시
        ctx.fillText(session.taskTitle, blockX + 16, startY + blockHeight / 2);

        ctx.restore();
      }
      // blockHeight < 20: 텍스트 표시 안함
    });

    // 현재 Time 막대
    const currentY =
      TOP_MARGIN +
      currentHour * HOUR_HEIGHT +
      (currentMinute / 60) * HOUR_HEIGHT;

    ctx.strokeStyle = colors.currentTimeLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(LEFT_MARGIN, currentY);
    ctx.lineTo(canvasSize.width, currentY);
    ctx.stroke();

    // 현재 Time 원
    ctx.fillStyle = colors.currentTimeLine;
    ctx.beginPath();
    ctx.arc(LEFT_MARGIN, currentY, 6, 0, Math.PI * 2);
    ctx.fill();

    // 블록 정보를 ref에 Save
    sessionBlocksRef.current = blocks;
  }, [canvasSize, todaySessions, currentHour, currentMinute, isDarkMode]);

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

    console.log("HourlyView - Click coords:", {
      x,
      y,
      scrollTop: containerRef.current.scrollTop,
    });
    console.log("HourlyView - Total blocks:", sessionBlocksRef.current.length);

    // 클릭된 블록 찾기 (역순으로 검색하여 가장 위의 블록 우선)
    let found = false;
    for (let i = sessionBlocksRef.current.length - 1; i >= 0; i--) {
      const block = sessionBlocksRef.current[i];
      const inX = x >= block.x && x <= block.x + block.width;
      const inY = y >= block.y && y <= block.y + block.height;

      console.log(`Block ${i} "${block.session.taskTitle}":`, {
        blockRange: `x:${block.x}-${block.x + block.width}, y:${block.y}-${
          block.y + block.height
        }`,
        clickInX: inX,
        clickInY: inY,
        match: inX && inY,
      });

      if (inX && inY) {
        console.log("✓ HourlyView - Clicked block:", block.session.taskTitle);
        onSessionClick(block.session);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log("✗ No block matched the click coordinates");
    }
  };

  // 현재 Time으로 스크롤
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

  return (
    <div className="relative h-full overflow-hidden">
      {/* 하단 블러 효과 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background dark:from-background to-transparent pointer-events-none z-20" />

      <div
        ref={containerRef}
        className="overflow-y-auto overflow-x-hidden h-full"
      >
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
