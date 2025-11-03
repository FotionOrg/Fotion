"use client";

import { useState, useEffect } from "react";
import { UserSettings } from "@/types";
import { useTranslations } from "next-intl";
import { isElectron } from "@/hooks/useElectronShortcuts";

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

interface DownloadInfo {
  version: string;
  releaseDate: string;
  platforms: {
    [key: string]: {
      name: string;
      files: Array<{
        type: string;
        url: string;
        size: string;
        arch: string;
      }>;
      minVersion: string;
    };
  };
  features: { [key: string]: string[] };
}

export default function SettingsTab({
  settings,
  onUpdateSettings,
}: SettingsTabProps) {
  const t = useTranslations();
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(false);

  // 다운로드 정보 가져오기 (GitHub Releases API 사용)
  useEffect(() => {
    if (!isElectron()) {
      const loadDownloadInfo = async () => {
        try {
          const res = await fetch("https://api.github.com/repos/FotionOrg/Fotion/releases/latest");
          const data = await res.json();

          // GitHub Release 데이터를 우리 형식으로 변환
          interface GitHubAsset {
            name: string;
            browser_download_url: string;
            size: number;
          }

          const assets: GitHubAsset[] = data.assets || [];
          const macFiles = assets.filter((a) =>
            a.name.endsWith('.dmg') || a.name.endsWith('.zip')
          );
          const winFiles = assets.filter((a) => a.name.endsWith('.exe'));

          const transformedData: DownloadInfo = {
            version: data.tag_name || "v0.1.0",
            releaseDate: new Date(data.published_at).toLocaleDateString(),
            platforms: {
              mac: {
                name: "macOS",
                files: macFiles.map((file) => ({
                  type: file.name.endsWith('.dmg') ? 'dmg' : 'zip',
                  url: file.browser_download_url,
                  size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                  arch: "universal"
                })),
                minVersion: "macOS 10.15+"
              },
              windows: {
                name: "Windows",
                files: winFiles.map((file) => ({
                  type: 'exe',
                  url: file.browser_download_url,
                  size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                  arch: "x64"
                })),
                minVersion: "Windows 10+"
              }
            },
            features: {}
          };
          setDownloadInfo(transformedData);
        } catch (err) {
          console.error("Failed to load download info:", err);
          setDownloadInfo(null);
        } finally {
          setIsLoadingDownloads(false);
        }
      };

      loadDownloadInfo();
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    onUpdateSettings(localSettings);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleTimerDurationChange = (value: number) => {
    setLocalSettings({ ...localSettings, defaultTimerDuration: value });
  };

  const handleOAuthConnect = (
    provider: "google" | "notion" | "todoist" | "linear"
  ) => {
    // TODO: OAuth 연동 로직 구현
    console.log(`Connecting to ${provider}...`);
    alert(t("settings.oauthComingSoon"));
  };

  const handleOAuthDisconnect = (
    provider: "google" | "notion" | "todoist" | "linear"
  ) => {
    const key = `${provider}Connected` as keyof UserSettings;
    setLocalSettings({ ...localSettings, [key]: false });
  };

  const oauthProviders = [
    {
      id: "google" as const,
      name: t("settings.googleCalendar"),
      icon: "📅",
      description: t("settings.googleCalendarDescription"),
      connected: localSettings.googleConnected,
    },
    {
      id: "notion" as const,
      name: "Notion",
      icon: "📝",
      description: t("settings.notionDescription"),
      connected: localSettings.notionConnected,
    },
    {
      id: "todoist" as const,
      name: "Todoist",
      icon: "✅",
      description: t("settings.todoistDescription"),
      connected: localSettings.todoistConnected,
    },
    {
      id: "linear" as const,
      name: "Linear",
      icon: "🎯",
      description: t("settings.linearDescription"),
      connected: localSettings.linearConnected,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("nav.settings")}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("settings.settingsDescription")}
          </p>
        </div>

        {/* 타이머 Settings */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            {t("settings.timerSettings")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {t("settings.defaultTimerDuration")}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={localSettings.defaultTimerDuration}
                  onChange={(e) =>
                    handleTimerDurationChange(Number(e.target.value))
                  }
                  className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex items-center gap-2 min-w-[100px]">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    value={localSettings.defaultTimerDuration}
                    onChange={(e) =>
                      handleTimerDurationChange(Number(e.target.value))
                    }
                    className="w-20 px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t("common.minute")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                {t("settings.defaultTimerNote")}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isSaving ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </div>
        </section>

        {/* OAuth 연동 */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">🔗</span>
            {t("settings.externalServices")}
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
                          {t("common.connected")}
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
                      {t("common.disconnect")}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOAuthConnect(provider.id)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                    >
                      {t("common.connect")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              ℹ️ {t("settings.oauthComingSoon")}
            </p>
          </div>
        </section>

        {/* Desktop App 다운로드 (PWA 사용자에게만 표시) */}
        {!isElectron() && downloadInfo && (
          <section className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800 p-6">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">💻</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {t("settings.desktopAppTitle")}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("settings.desktopAppDescription")}
                </p>
              </div>
            </div>

            {/* 버전 정보 */}
            <div className="mb-4 p-3 bg-white dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t("settings.version")}:{" "}
                  </span>
                  <span className="font-semibold text-foreground">
                    {downloadInfo.version}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t("settings.released")}:{" "}
                  </span>
                  <span className="font-medium text-foreground">
                    {downloadInfo.releaseDate}
                  </span>
                </div>
              </div>
            </div>

            {/* 플랫폼별 다운로드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* macOS */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <h3 className="font-semibold text-foreground">macOS</h3>
                    <p className="text-xs text-zinc-500">
                      {downloadInfo.platforms.mac.minVersion}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {downloadInfo.platforms.mac.files.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                    >
                      {t("settings.downloadNow")} (.{file.type})
                      <div className="text-xs opacity-80 mt-0.5">
                        {file.size}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Windows */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🪟</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Windows</h3>
                    <p className="text-xs text-zinc-500">
                      {downloadInfo.platforms.windows.minVersion}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {downloadInfo.platforms.windows.files.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                    >
                      {file.type === "exe"
                        ? t("settings.installer")
                        : t("settings.portable")}
                      <div className="text-xs opacity-80 mt-0.5">
                        {file.size}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* 기능 소개 */}
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 text-sm">
                {t("settings.whyDesktopApp")}
              </h4>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>{t("settings.desktopFeature1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>{t("settings.desktopFeature2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>{t("settings.desktopFeature3")}</span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* Electron 사용 중 안내 */}
        {isElectron() && (
          <section className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  {t("settings.currentlyUsing")}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {t("settings.version")}: 1.0.0
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
