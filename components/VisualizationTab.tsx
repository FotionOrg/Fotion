"use client";

import { memo } from "react";
import { VisualizationView, FocusSession } from "@/types";
import { useState } from "react";
import HourlyViewCanvas from "./views/HourlyViewCanvas";
import WeeklyViewCanvas from "./views/WeeklyViewCanvas";
import SessionDetailModal from "./SessionDetailModal";

interface VisualizationTabProps {
  sessions: FocusSession[];
  onStartFocus: () => void;
}

function VisualizationTab({ sessions, onStartFocus }: VisualizationTabProps) {
  const [currentView, setCurrentView] = useState<VisualizationView>("hourly");
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const handleSessionClick = (session: FocusSession) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 뷰 전환 탭 */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-surface dark:bg-surface">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex md:justify-start justify-stretch w-full md:w-auto">
            <ViewSwitchButton
              active={currentView === "hourly"}
              onClick={() => setCurrentView("hourly")}
              title="Time별"
              icon={<ClockIcon />}
            />
            <ViewSwitchButton
              active={currentView === "daily"}
              onClick={() => setCurrentView("daily")}
              title="주간"
              icon={<CalendarIcon />}
            />
          </div>
        </div>
      </div>

      {/* 뷰 내용 */}
      <div className="flex-1 overflow-hidden">
        {currentView === "hourly" && (
          <HourlyViewCanvas sessions={sessions} onSessionClick={handleSessionClick} />
        )}
        {currentView === "daily" && (
          <WeeklyViewCanvas sessions={sessions} onSessionClick={handleSessionClick} />
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

// 뷰 전환 버튼 컴포넌트
interface ViewSwitchButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}

function ViewSwitchButton({
  active,
  onClick,
  title,
  icon,
}: ViewSwitchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 md:flex-none md:w-24 py-3 flex items-center justify-center transition-colors ${
        active
          ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

// 아이콘 컴포넌트들
function ClockIcon() {
  return (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
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
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export default memo(VisualizationTab);
