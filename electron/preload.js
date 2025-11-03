const { contextBridge, ipcRenderer } = require('electron');

// Electron API를 안전하게 Next.js 앱에 노출
contextBridge.exposeInMainWorld('electron', {
  // 플랫폼 정보
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 글로벌 단축키 이벤트 수신
  onGlobalShortcut: (callback) => {
    const subscription = (event, action) => callback(action);
    ipcRenderer.on('global-shortcut', subscription);

    // cleanup 함수 반환
    return () => {
      ipcRenderer.removeListener('global-shortcut', subscription);
    };
  },

  // 단축키 설정 업데이트
  updateShortcuts: (shortcuts) => {
    ipcRenderer.send('update-shortcuts', shortcuts);
  },

  // Electron 환경 확인
  isElectron: true,
});
