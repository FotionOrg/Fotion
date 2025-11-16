"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { VisualizationView, FocusSession, Task } from "@/types";
import { useState } from "react";
import HourlyViewCanvas from "./views/HourlyViewCanvas";
import WeeklyViewCanvas from "./views/WeeklyViewCanvas";

// 동적 임포트 - 모달 (세션 클릭 시에만 필요)
const SessionDetailModal = dynamic(() => import("./SessionDetailModal"), { ssr: false });

interface VisualizationTabProps {
  sessions: FocusSession[];
  tasks: Task[];
  onStartFocus: () => void;
}

function VisualizationTab({ sessions, tasks, onStartFocus }: VisualizationTabProps) {
  const [currentView, setCurrentView] = useState<VisualizationView>("hourly");
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const handleSessionClick = (session: FocusSession) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 뷰 전환 토글 버튼 - 우측 상단 */}
      <div className="absolute top-4 right-4 z-30">
        <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 shadow-sm">
          <button
            onClick={() => setCurrentView("hourly")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              currentView === "hourly"
                ? "bg-primary-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setCurrentView("daily")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              currentView === "daily"
                ? "bg-primary-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* 뷰 내용 */}
      <div className="flex-1 overflow-hidden">
        {currentView === "hourly" && (
          <HourlyViewCanvas sessions={sessions} tasks={tasks} onSessionClick={handleSessionClick} />
        )}
        {currentView === "daily" && (
          <WeeklyViewCanvas sessions={sessions} tasks={tasks} onSessionClick={handleSessionClick} />
        )}
      </div>

      {/* Start Focus FAB */}
      <button
        onClick={onStartFocus}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 dark:bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center justify-center z-40"
        title="Focus Mode Start"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* 세션 상세 모달 */}
      <SessionDetailModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        session={selectedSession}
      />
    </div>
  );
}

export default memo(VisualizationTab);
