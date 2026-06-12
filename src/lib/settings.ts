export interface FotionSettings {
  awServerUrl: string;
  dayBoundaryMinutes: number;
}

const STORAGE_KEY = "fotion.settings.v1";

export const DEFAULT_SETTINGS: FotionSettings = {
  awServerUrl: "http://localhost:5600",
  dayBoundaryMinutes: 4 * 60,
};

export function loadSettings(): FotionSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FotionSettings>;
    return normalizeSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: FotionSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
}

export function normalizeSettings(settings: Partial<FotionSettings>): FotionSettings {
  const awServerUrl = normalizeAwUrl(settings.awServerUrl ?? DEFAULT_SETTINGS.awServerUrl);
  const dayBoundaryMinutes = clampBoundary(settings.dayBoundaryMinutes ?? DEFAULT_SETTINGS.dayBoundaryMinutes);

  return {
    awServerUrl,
    dayBoundaryMinutes,
  };
}

export function minutesToTimeInput(minutes: number): string {
  const safeMinutes = clampBoundary(minutes);
  const hours = Math.floor(safeMinutes / 60).toString().padStart(2, "0");
  const mins = (safeMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

export function timeInputToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return DEFAULT_SETTINGS.dayBoundaryMinutes;
  }
  return clampBoundary(hours * 60 + minutes);
}

function normalizeAwUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return DEFAULT_SETTINGS.awServerUrl;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

function clampBoundary(minutes: number): number {
  if (!Number.isFinite(minutes)) {
    return DEFAULT_SETTINGS.dayBoundaryMinutes;
  }
  return Math.min(23 * 60 + 59, Math.max(0, Math.round(minutes)));
}
