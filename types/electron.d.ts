// Electron API 타입 정의
export interface ElectronAPI {
  getPlatform: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  onGlobalShortcut: (callback: (action: string) => void) => () => void;
  updateShortcuts: (shortcuts: Record<string, string>) => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
