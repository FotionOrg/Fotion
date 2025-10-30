"use client";

import { AppTab } from "@/types";

interface BrowserTabBarProps {
  tabs: AppTab[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export default function BrowserTabBar({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
}: BrowserTabBarProps) {
  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const getTabIcon = (type: AppTab["type"]) => {
    console.log("탭 type :", type);
    switch (type) {
      case "visualization":
        return "🏠";
      case "tasks":
        return "📋";
      case "focus":
        return "⏱️";
      case "statistics":
        return "📊";
      default:
        return "";
    }
  };

  return (
    <div className="bg-surface-secondary dark:bg-surface border-b border-zinc-200 dark:border-zinc-800">
      {/* 탭들 - 좌측 정렬 */}
      <div className="flex items-start overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 min-w-[120px] max-w-[200px]
                transition-all border-r border-zinc-200 dark:border-zinc-800 cursor-pointer
                ${
                  isActive
                    ? "bg-background dark:bg-background text-foreground dark:text-foreground border-b-2 border-b-primary-500"
                    : "bg-surface-secondary dark:bg-surface-secondary text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }
              `}
            >
              {/* 아이콘 */}
              <span className="text-base flex-shrink-0">
                {getTabIcon(tab.type)}
              </span>

              {/* 제목 */}
              <span className="flex-1 text-sm font-medium truncate text-left">
                {tab.title}
              </span>

              {/* 타이머 표시 (집중 모드 탭) */}
              {tab.type === "focus" && tab.timerState && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex-shrink-0">
                  {formatTimer(tab.timerState)}
                </span>
              )}

              {/* 닫기 버튼 (고정되지 않은 탭만) */}
              {!tab.isPinned && (
                <button
                  onClick={(e) => handleCloseClick(e, tab.id)}
                  className="flex-shrink-0 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
                  title="탭 닫기"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {/* 활성 탭 표시 (하단 강조) - 이미 border로 처리됨 */}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimer(timerState: AppTab["timerState"]): string {
  if (!timerState) return "";

  const now = Date.now();
  const elapsed = timerState.isRunning
    ? now - timerState.startTime
    : timerState.elapsedTime;

  if (timerState.mode === "timer" && timerState.duration) {
    const remaining = Math.max(0, timerState.duration - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}
