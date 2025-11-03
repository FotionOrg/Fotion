"use client";

import { useState } from "react";
import { UserSettings } from "@/types";
import { useTranslations } from "next-intl";

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const t = useTranslations();
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
    alert(t('settings.oauthComingSoon'));
  };

  const handleOAuthDisconnect = (provider: 'google' | 'notion' | 'todoist' | 'linear') => {
    const key = `${provider}Connected` as keyof UserSettings;
    setLocalSettings({ ...localSettings, [key]: false });
  };

  const oauthProviders = [
    {
      id: 'google' as const,
      name: t('settings.googleCalendar'),
      icon: '📅',
      description: t('settings.googleCalendarDescription'),
      connected: localSettings.googleConnected,
    },
    {
      id: 'notion' as const,
      name: 'Notion',
      icon: '📝',
      description: t('settings.notionDescription'),
      connected: localSettings.notionConnected,
    },
    {
      id: 'todoist' as const,
      name: 'Todoist',
      icon: '✅',
      description: t('settings.todoistDescription'),
      connected: localSettings.todoistConnected,
    },
    {
      id: 'linear' as const,
      name: 'Linear',
      icon: '🎯',
      description: t('settings.linearDescription'),
      connected: localSettings.linearConnected,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('nav.settings')}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('settings.settingsDescription')}
          </p>
        </div>

        {/* 타이머 Settings */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            {t('settings.timerSettings')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {t('settings.defaultTimerDuration')}
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
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('common.minute')}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                {t('settings.defaultTimerNote')}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isSaving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </section>

        {/* OAuth 연동 */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">🔗</span>
            {t('settings.externalServices')}
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
                          {t('common.connected')}
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
                      {t('common.disconnect')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOAuthConnect(provider.id)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                    >
                      {t('common.connect')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              ℹ️ {t('settings.oauthComingSoon')}
            </p>
          </div>
        </section>

        {/* 앱 정보 */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            {t('settings.appInfo')}
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">{t('common.version')}</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">{t('settings.projectName')}</span>
              <span className="font-medium text-foreground">Fotion (Project Linnaeus)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-600 dark:text-zinc-400">{t('task.description')}</span>
              <span className="font-medium text-foreground text-right">{t('settings.projectDescription')}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
