"use client";

import { useState } from "react";
import { UserSettings } from "@/types";

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    onUpdateSettings(localSettings);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleTimerDurationChange = (value: number) => {
    setLocalSettings({ ...localSettings, defaultTimerDuration: value });
  };

  const handleOAuthConnect = (provider: 'google' | 'notion' | 'todoist' | 'linear') => {
    // TODO: OAuth 연동 로직 구현
    console.log(`Connecting to ${provider}...`);
    alert(`${provider} 연동 기능은 곧 추가될 예정입니다.`);
  };

  const handleOAuthDisconnect = (provider: 'google' | 'notion' | 'todoist' | 'linear') => {
    const key = `${provider}Connected` as keyof UserSettings;
    setLocalSettings({ ...localSettings, [key]: false });
  };

  const oauthProviders = [
    {
      id: 'google' as const,
      name: 'Google Calendar',
      icon: '📅',
      description: '구글 캘린더와 일정을 동기화합니다',
      connected: localSettings.googleConnected,
    },
    {
      id: 'notion' as const,
      name: 'Notion',
      icon: '📝',
      description: 'Notion 데이터베이스에서 작업을 가져옵니다',
      connected: localSettings.notionConnected,
    },
    {
      id: 'todoist' as const,
      name: 'Todoist',
      icon: '✅',
      description: 'Todoist 작업을 동기화합니다',
      connected: localSettings.todoistConnected,
    },
    {
      id: 'linear' as const,
      name: 'Linear',
      icon: '🎯',
      description: 'Linear 이슈를 가져옵니다',
      connected: localSettings.linearConnected,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">설정</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            앱 동작과 외부 서비스 연동을 관리합니다
          </p>
        </div>

        {/* 타이머 설정 */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            타이머 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                기본 타이머 시간
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={localSettings.defaultTimerDuration}
                  onChange={(e) => handleTimerDurationChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex items-center gap-2 min-w-[100px]">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    value={localSettings.defaultTimerDuration}
                    onChange={(e) => handleTimerDurationChange(Number(e.target.value))}
                    className="w-20 px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">분</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                집중 시작 시 기본으로 설정될 타이머 시간입니다
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </section>

        {/* OAuth 연동 */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">🔗</span>
            외부 서비스 연동
          </h2>

          <div className="space-y-4">
            {oauthProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {provider.description}
                    </p>
                    {provider.connected && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          연결됨
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {provider.connected ? (
                    <button
                      onClick={() => handleOAuthDisconnect(provider.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      연결 해제
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOAuthConnect(provider.id)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                    >
                      연결하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              ℹ️ 외부 서비스 연동 기능은 향후 업데이트에서 제공될 예정입니다. 연결하기 버튼을 클릭하면 OAuth 인증 페이지로 이동합니다.
            </p>
          </div>
        </section>

        {/* 앱 정보 */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            앱 정보
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">버전</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">프로젝트명</span>
              <span className="font-medium text-foreground">Fotion (Project Linnaeus)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-600 dark:text-zinc-400">설명</span>
              <span className="font-medium text-foreground text-right">Task 관리 + 집중 모드</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
