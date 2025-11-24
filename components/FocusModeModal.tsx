"use client";

import { Task, TimerMode } from "@/types";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getTaskColorClasses } from "@/lib/colors";

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  queuedTaskIds: string[]; // Task Queue에 있는 task ID 목록
  defaultTimerDuration: number; // 기본 타이머 Time (분)
  onStart: (
    taskId: string,
    mode: TimerMode,
    duration?: number,
    task?: Task
  ) => void;
  onOpenTasksTab?: () => void; // Tasks 탭 열기
  onOpenSettingsTab?: () => void; // Settings 탭 열기
  onCreateTask?: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<Task>; // Quick Start용 task 생성
  hasFocusSession?: boolean; // 이미 집중 세션이 있는지
}

export default function FocusModeModal({
  isOpen,
  onClose,
  tasks,
  queuedTaskIds,
  defaultTimerDuration,
  onStart,
  onOpenTasksTab,
  onOpenSettingsTab,
  onCreateTask,
  hasFocusSession = false,
}: FocusModeModalProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [quickStartTitle, setQuickStartTitle] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickStartInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setSearchQuery("");
    setSelectedTask(null);
    setQuickStartTitle("");
  };

  // Task Queue에 있는 Task들만 표시
  const queuedTasks = queuedTaskIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined);

  const filteredTasks = queuedTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStart = async () => {
    // Quick Start 모드 (큐가 없을 때)
    if (queuedTasks.length === 0 && quickStartTitle.trim() && onCreateTask) {
      const taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
        title: quickStartTitle,
        description: "",
        status: "in_progress",
        priority: "medium",
        source: "internal",
        color: "blue",
      };

      try {
        console.log("[FocusModeModal] Creating task:", taskData);
        // Task 생성을 기다림
        const createdTask = await onCreateTask(taskData);
        console.log("[FocusModeModal] Task created:", createdTask);

        const duration = defaultTimerDuration * 60 * 1000;

        // 생성된 task로 바로 집중 모드 시작
        console.log(
          "[FocusModeModal] Starting focus with task:",
          createdTask.id
        );
        onStart(createdTask.id, "timer", duration, createdTask);
        onClose();
      } catch (error) {
        console.error("[FocusModeModal] Failed to create task:", error);
        // 에러 발생 시에도 모달은 닫지 않음 (사용자가 다시 시도할 수 있도록)
      }
      return;
    }

    // 일반 모드 (task 선택)
    if (!selectedTask) return;

    const duration = defaultTimerDuration * 60 * 1000;
    onStart(selectedTask.id, "timer", duration);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetModal();
      // Auto focus on appropriate input
      setTimeout(() => {
        if (queuedTaskIds.length === 0) {
          quickStartInputRef.current?.focus();
        } else {
          searchInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, queuedTaskIds.length]);

  // ESC key handler & Command/Ctrl+Enter handler
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Command+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        // Check if can start
        const canStart = !hasFocusSession && (
          queuedTasks.length === 0
            ? quickStartTitle.trim() !== ""
            : selectedTask !== null
        );

        if (!canStart) return;

        // Quick Start 모드 (큐가 없을 때)
        if (queuedTasks.length === 0 && quickStartTitle.trim() && onCreateTask) {
          const taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
            title: quickStartTitle,
            description: "",
            status: "in_progress",
            priority: "medium",
            source: "internal",
            color: "blue",
          };

          try {
            const createdTask = await onCreateTask(taskData);
            const duration = defaultTimerDuration * 60 * 1000;
            onStart(createdTask.id, "timer", duration, createdTask);
            onClose();
          } catch (error) {
            console.error("[FocusModeModal] Failed to create task:", error);
          }
          return;
        }

        // 일반 모드 (task 선택)
        if (selectedTask) {
          const duration = defaultTimerDuration * 60 * 1000;
          onStart(selectedTask.id, "timer", duration);
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose, hasFocusSession, queuedTasks, quickStartTitle, selectedTask, onCreateTask, defaultTimerDuration, onStart]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-mode-title"
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2
            id="focus-mode-title"
            className="text-xl font-semibold text-foreground"
          >
            {t("focus.startFocus")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-foreground"
            aria-label="Close modal"
            tabIndex={0}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 검색/Quick Start 입력 영역 */}
        <div className="p-6 pb-4 shrink-0">
          {queuedTasks.length > 0 ? (
            // 큐가 있을 때: 검색창
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("task.selectTask")}
              </label>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("task.searchTasks")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-border-secondary rounded-lg bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                tabIndex={0}
              />
            </div>
          ) : (
            // 큐가 없을 때: Quick Start 입력창
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("focus.quickStart") || "Quick Start"}
              </label>
              <input
                ref={quickStartInputRef}
                type="text"
                placeholder={
                  t("focus.quickStartPlaceholder") || "무엇에 집중하시겠습니까?"
                }
                value={quickStartTitle}
                onChange={(e) => setQuickStartTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickStartTitle.trim()) {
                    handleStart();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-primary-300 dark:border-primary-700 rounded-lg bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                {t("focus.quickStartNote") || "Enter 키를 눌러 바로 시작하세요"}
              </p>
            </div>
          )}
        </div>

        {/* Task 리스트 - 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="space-y-2">
            {queuedTasks.length === 0 ? (
              // 큐가 비어있을 때: Tasks 탭 바로가기만 표시
              <div className="space-y-4 py-4">
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                    {t("task.queueEmpty")}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {t("task.queueEmptyDescription")}
                  </p>
                </div>

                {/* Tasks 탭 바로가기 */}
                {onOpenTasksTab && (
                  <button
                    onClick={() => {
                      onOpenTasksTab();
                      onClose();
                    }}
                    className="w-full px-4 py-3 bg-surface-secondary hover:bg-zinc-100 dark:hover:bg-zinc-700 border-2 border-border rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <div className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                          {t("focus.goToTasks") || "Tasks 탭으로 이동"}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {t("focus.goToTasksDescription") ||
                            "작업을 관리하고 큐에 추가하기"}
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ) : searchQuery ? (
              filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    t={t}
                  />
                ))
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-4 text-sm">
                  {t("task.noSearchResults")}
                </p>
              )
            ) : (
              <>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  {t("task.taskQueue")}
                </p>
                {queuedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    t={t}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* 타이머 Time 안내 - 고정 영역 */}
        <div className="px-6 py-4 shrink-0">
          <div className="bg-primary-50 dark:bg-primary-950 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                ⏱️
              </span>
              <span
                onClick={() => {
                  if (onOpenSettingsTab) {
                    onOpenSettingsTab();
                    onClose();
                  }
                }}
                className={`text-primary-700 dark:text-primary-300 ${
                  onOpenSettingsTab ? "cursor-pointer hover:underline" : ""
                }`}
              >
                {t("focus.timerInfo", { duration: defaultTimerDuration })}
              </span>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 pt-0 shrink-0">
          {hasFocusSession && (
            <div className="mb-3 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ {t("focus.sessionAlreadyExistsWarning") || "이미 진행 중인 집중 세션이 있습니다. 기존 세션을 먼저 종료해주세요."}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-surface-secondary hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium text-foreground cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleStart}
              disabled={
                hasFocusSession ||
                (queuedTasks.length === 0 ? !quickStartTitle.trim() : !selectedTask)
              }
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              {t("common.start")}
            </button>
          </div>
          {!hasFocusSession && (
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-2">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono text-xs">⌘+Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono text-xs">Ctrl+Enter</kbd> to start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskItem({
  task,
  isSelected,
  onSelect,
  t,
}: {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  t: (key: string) => string;
}) {
  const colorClasses = getTaskColorClasses(task.color);

  const sourceColors = {
    internal:
      "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    notion:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    todoist: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    linear:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    "google-calendar":
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  };

  const getSourceLabel = (source: string) => {
    if (source === "internal") return t("task.internal");
    if (source === "google-calendar") return "Google Calendar";
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
        colorClasses.bgLight
      } ${
        isSelected
          ? `${colorClasses.border} ring-2 ${colorClasses.border.replace(
              "border-",
              "ring-"
            )}`
          : `${colorClasses.border} hover:shadow-md`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-sm truncate ${colorClasses.textLight}`}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {task.scheduledTime && <span>🕐 {task.scheduledTime}</span>}
            {task.estimatedDuration && (
              <span>
                ⏱ {task.estimatedDuration}
                {t("common.minute")}
              </span>
            )}
          </div>
        </div>
        <span
          className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${
            sourceColors[task.source]
          }`}
        >
          {getSourceLabel(task.source)}
        </span>
      </div>
    </button>
  );
}
