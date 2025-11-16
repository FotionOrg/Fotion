"use client";

import { AppTab } from "@/types";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('nav');

  // 현재 열린 Visualization 탭과 Task관리 탭 찾기
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
          fixed lg:relative top-0 left-0 h-screen lg:h-full w-60 bg-surface border-r border-border flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* 상단 로고/타이틀 영역 */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">Fotion</h1>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {/* Visualization 탭 */}
          <button
            onClick={() => handleOpenTab("visualization")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              visualizationTab && activeTabId === visualizationTab.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-sm font-medium">{t("visualization")}</span>
            {visualizationTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>

          {/* Tasks 탭 */}
          <button
            onClick={() => handleOpenTab("tasks")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left mt-1 ${
              tasksTab && activeTabId === tasksTab.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xl">📋</span>
            <span className="text-sm font-medium">{t("tasks")}</span>
            {tasksTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>

          {/* Statistics 탭 */}
          <button
            onClick={() => handleOpenTab("statistics")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left mt-1 ${
              statisticsTab && activeTabId === statisticsTab.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium">{t("statistics")}</span>
            {statisticsTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>

          {/* 구분선 */}
          <div className="my-4 border-t border-border"></div>

          {/* Focus Mode 탭들 */}
          <div className="space-y-1">
            <p className="px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("focusSessions")}
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
        <div className="border-t border-border">
          {/* Settings 탭 */}
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
              <span className="text-sm font-medium">{t("settings")}</span>
              {settingsTab && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
              )}
            </button>
          </div>

          {/* 단축키 정보 */}
          {onShowShortcuts && (
            <div className="p-2 border-t border-border">
              <button
                onClick={onShowShortcuts}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">⌨️</span>
                  <span className="text-sm font-medium">{t("showShortcuts")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    ⌘
                  </kbd>
                  <span className="text-zinc-400 dark:text-zinc-600">/</span>
                  <kbd className="px-2 py-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    ?
                  </kbd>
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
