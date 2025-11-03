import { useEffect } from 'react';

export function useElectronShortcuts(handlers: {
  onStartFocus?: () => void;
  onEndSession?: () => void;
}) {
  useEffect(() => {
    // Electron 환경이 아니면 종료
    if (typeof window === 'undefined' || !window.electron) {
      return;
    }

    // 글로벌 단축키 이벤트 리스너 등록
    const unsubscribe = window.electron.onGlobalShortcut((action) => {
      console.log('Global shortcut received:', action);

      switch (action) {
        case 'start-focus':
          handlers.onStartFocus?.();
          break;
        case 'end-session':
          handlers.onEndSession?.();
          break;
        default:
          console.warn('Unknown shortcut action:', action);
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [handlers]);
}

// Electron 환경 감지 Helper
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electron?.isElectron;
}

// 플랫폼 정보 가져오기
export async function getPlatform(): Promise<string | null> {
  if (!isElectron()) return null;
  return window.electron!.getPlatform();
}

// 앱 버전 가져오기
export async function getAppVersion(): Promise<string | null> {
  if (!isElectron()) return null;
  return window.electron!.getAppVersion();
}
