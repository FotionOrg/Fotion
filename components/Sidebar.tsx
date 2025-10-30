"use client";

import { AppTab } from "@/types";

interface SidebarProps {
  tabs: AppTab[];
  activeTabId: string | null;
  onOpenTab: (tabType: "visualization" | "tasks" | "statistics" | "settings") => void;
  onTabChange: (tabId: string) => void;
  onShowShortcuts?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  tabs,
  activeTabId,
  onOpenTab,
  onTabChange,
  onShowShortcuts,
  isOpen,
  onClose,
}: SidebarProps) {
  // 현재 열린 시각화 탭과 작업관리 탭 찾기
  const visualizationTab = tabs.find((t) => t.type === "visualization");
  const tasksTab = tabs.find((t) => t.type === "tasks");
  const statisticsTab = tabs.find((t) => t.type === "statistics");
  const settingsTab = tabs.find((t) => t.type === "settings");

  const handleOpenTab = (tabType: "visualization" | "tasks" | "statistics" | "settings") => {
    onOpenTab(tabType);
    // 모바일에서는 탭 열면 사이드바 자동 닫기
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* 모바일 오버레이 배경 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-screen w-60 bg-surface border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* 상단 로고/타이틀 영역 */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-semibold text-foreground">Fotion</h1>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {/* 시각화 탭 */}
          <button
            onClick={() => handleOpenTab("visualization")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              visualizationTab && activeTabId === visualizationTab.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-sm font-medium">시각화</span>
            {visualizationTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>

          {/* 작업 관리 탭 */}
          <button
            onClick={() => handleOpenTab("tasks")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left mt-1 ${
              tasksTab && activeTabId === tasksTab.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xl">📋</span>
            <span className="text-sm font-medium">작업 관리</span>
            {tasksTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>

          {/* 통계 탭 */}
          <button
            onClick={() => handleOpenTab("statistics")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left mt-1 ${
              statisticsTab && activeTabId === statisticsTab.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium">통계</span>
            {statisticsTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>

          {/* 구분선 */}
          <div className="my-4 border-t border-zinc-200 dark:border-zinc-800"></div>

          {/* 집중 모드 탭들 */}
          <div className="space-y-1">
            <p className="px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              집중 세션
            </p>
            {tabs
              .filter((tab) => tab.type === "focus")
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    activeTabId === tab.id
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-xl">⏱️</span>
                  <span className="text-sm font-medium truncate flex-1">
                    {tab.title}
                  </span>
                </button>
              ))}
          </div>
        </nav>

        {/* 하단 영역 */}
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          {/* 설정 탭 */}
          <div className="p-2">
            <button
              onClick={() => handleOpenTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                settingsTab && activeTabId === settingsTab.id
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium">설정</span>
              {settingsTab && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
              )}
            </button>
          </div>

          {/* 단축키 정보 */}
          {onShowShortcuts && (
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 text-left"
                onClick={onShowShortcuts}
              >
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">
                  Shift + ?
                </kbd>{" "}
                단축키 보기
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
