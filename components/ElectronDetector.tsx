'use client';

import { useEffect } from 'react';

export function ElectronDetector() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron?.isElectron) {
      // Electron 환경 감지
      document.body.classList.add('electron-app');

      // 플랫폼 감지
      window.electron.getPlatform().then((platform) => {
        if (platform) {
          document.body.classList.add(`platform-${platform}`);
        }
      });
    }
  }, []);

  return null;
}
