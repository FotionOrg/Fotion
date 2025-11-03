const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // macOS: 타이틀바 숨기고 트래픽 라이트 버튼만 표시
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    // Windows/Linux: 기본 타이틀바 사용
    frame: true,
    backgroundColor: '#ffffff',
    title: 'Fotion',
  });

  // 개발 모드: Next.js dev 서버에 연결
  // 프로덕션 모드: 빌드된 Next.js 앱 로드
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startURL);

  // 개발자 도구 (개발 모드에서만)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 글로벌 단축키 등록
function registerGlobalShortcuts() {
  // Cmd+Shift+F (macOS) / Ctrl+Shift+F (Windows/Linux): 앱 포커스
  const focusAppShortcut = process.platform === 'darwin' ? 'Command+Shift+F' : 'Control+Shift+F';
  globalShortcut.register(focusAppShortcut, () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Cmd+Shift+S (macOS) / Ctrl+Shift+S (Windows/Linux): 집중 시작
  const startFocusShortcut = process.platform === 'darwin' ? 'Command+Shift+S' : 'Control+Shift+S';
  globalShortcut.register(startFocusShortcut, () => {
    if (mainWindow) {
      mainWindow.webContents.send('global-shortcut', 'start-focus');
    }
  });

  // Cmd+Shift+E (macOS) / Ctrl+Shift+E (Windows/Linux): 현재 세션 종료
  const endSessionShortcut = process.platform === 'darwin' ? 'Command+Shift+E' : 'Control+Shift+E';
  globalShortcut.register(endSessionShortcut, () => {
    if (mainWindow) {
      mainWindow.webContents.send('global-shortcut', 'end-session');
    }
  });

  console.log('Global shortcuts registered:');
  console.log(`  Focus app: ${focusAppShortcut}`);
  console.log(`  Start focus: ${startFocusShortcut}`);
  console.log(`  End session: ${endSessionShortcut}`);
}

// 앱 준비
app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 윈도우 닫힘 (macOS는 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱 종료 시 글로벌 단축키 해제
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC 핸들러
ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// 단축키 설정 업데이트 (향후 구현)
ipcMain.on('update-shortcuts', (event, shortcuts) => {
  // TODO: 사용자 정의 단축키 구현
  console.log('Shortcut update requested:', shortcuts);
});
