# Fotion Electron App

Fotion은 **PWA(Progressive Web App)** 로 제공되며, 브라우저에서 바로 사용 가능합니다.
**Electron 데스크톱 앱**은 글로벌 단축키 등 고급 기능을 원하는 사용자를 위한 **선택적 다운로드** 옵션입니다.

## PWA vs Electron

| 기능 | PWA (웹) | Electron (데스크톱) |
|------|----------|---------------------|
| 설치 | ❌ 불필요 (브라우저에서 바로 사용) | ✅ 앱 설치 필요 |
| 글로벌 단축키 | ❌ 지원 안 함 | ✅ 시스템 전역 단축키 지원 |
| 오프라인 | ✅ Service Worker | ✅ 완전한 오프라인 지원 |
| 알림 | ✅ 브라우저 알림 | ✅ 네이티브 알림 |
| 업데이트 | ✅ 자동 (새로고침) | ⚠️ 수동 또는 자동 업데이트 구현 필요 |
| 배포 | ✅ 웹 서버에 배포 | ⚠️ 플랫폼별 빌드 및 배포 |

**권장**: 대부분의 사용자는 PWA 버전을 사용하고, 글로벌 단축키가 필요한 파워 유저만 Electron 버전을 다운로드하세요.

## 개발 모드 실행

### 1. Next.js dev 서버와 Electron을 동시에 실행 (권장)

```bash
pnpm electron:dev
```

이 명령어는:
1. Next.js 개발 서버를 시작 (`localhost:3000`)
2. 서버가 준비될 때까지 대기
3. Electron 앱을 시작하여 Next.js 앱을 로드

### 2. 별도로 실행

**터미널 1: Next.js 개발 서버**
```bash
pnpm dev
```

**터미널 2: Electron 앱**
```bash
pnpm electron
```

## 프로덕션 빌드

### macOS 앱 빌드
```bash
pnpm electron:build:mac
```

출력: `dist/Fotion-{version}.dmg`, `dist/Fotion-{version}-mac.zip`

### Windows 앱 빌드
```bash
pnpm electron:build:win
```

출력: `dist/Fotion Setup {version}.exe`, `dist/Fotion {version}.exe` (portable)

### Linux 앱 빌드
```bash
pnpm electron:build:linux
```

출력: `dist/Fotion-{version}.AppImage`, `dist/fotion2_{version}_amd64.deb`

### 모든 플랫폼 빌드
```bash
pnpm electron:build
```

## 글로벌 단축키

Electron 앱에서는 시스템 전역 단축키를 사용할 수 있습니다.

| 단축키 | 동작 | 설명 |
|--------|------|------|
| `Cmd+Shift+F` (macOS)<br>`Ctrl+Shift+F` (Win/Linux) | 앱 포커스 | 앱을 최상단으로 가져오고 포커스합니다 |
| `Cmd+Shift+S` (macOS)<br>`Ctrl+Shift+S` (Win/Linux) | 집중 시작 | 집중 모드 시작 모달을 엽니다 |
| `Cmd+Shift+E` (macOS)<br>`Ctrl+Shift+E` (Win/Linux) | 세션 종료 | 현재 활성화된 집중 세션을 종료합니다 |

## 프로젝트 구조

```
Fotion/
├── electron/
│   ├── main.js          # Electron 메인 프로세스
│   └── preload.js       # Preload 스크립트 (IPC 브릿지)
├── hooks/
│   └── useElectronShortcuts.ts  # Electron 단축키 Hook
├── types/
│   └── electron.d.ts    # Electron API 타입 정의
└── package.json         # Electron 빌드 설정
```

## Electron 기능

### 1. 글로벌 단축키
- `electron/main.js`에서 `globalShortcut.register()` 사용
- Preload 스크립트를 통해 Next.js 앱에 이벤트 전달
- `useElectronShortcuts` Hook으로 이벤트 수신

### 2. IPC 통신
- **Main → Renderer**: `webContents.send('global-shortcut', action)`
- **Renderer → Main**: `ipcRenderer.send('update-shortcuts', shortcuts)`
- **Main ← Renderer**: `ipcRenderer.invoke('get-platform')`

### 3. 보안
- `contextIsolation: true` - 렌더러 프로세스와 preload 스크립트 격리
- `nodeIntegration: false` - Node.js API 직접 접근 차단
- `contextBridge` - 안전하게 선택된 API만 노출

## 개발 팁

### Electron DevTools
개발 모드에서는 자동으로 DevTools가 열립니다. `electron/main.js`에서 설정:

```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

### Electron 환경 감지
Next.js 앱에서 Electron 환경인지 확인:

```typescript
import { isElectron } from '@/hooks/useElectronShortcuts';

if (isElectron()) {
  // Electron 전용 기능
}
```

### 단축키 디버깅
글로벌 단축키 등록 시 콘솔에 로그 출력:

```
Global shortcuts registered:
  Focus app: Command+Shift+F
  Start focus: Command+Shift+S
  End session: Command+Shift+E
```

## 트러블슈팅

### 1. Electron이 시작되지 않음
- Node.js 버전 확인: Node.js 18+ 필요
- `pnpm install` 재실행
- `node_modules` 삭제 후 재설치

### 2. 글로벌 단축키가 작동하지 않음
- 다른 앱과 단축키 충돌 확인
- macOS: 시스템 환경설정 > 키보드 > 단축키에서 충돌 확인
- Windows: 다른 앱의 전역 단축키 확인

### 3. Next.js 앱이 로드되지 않음
- `pnpm dev`로 Next.js 서버가 정상 실행되는지 확인
- `localhost:3000`에서 브라우저로 접근 가능한지 확인
- `wait-on`이 타임아웃되는 경우 Next.js 서버 시작 시간 증가

### 4. 빌드 오류
- `assets/` 폴더에 아이콘 파일 확인 (없으면 경고만 표시)
- `electron-builder` 로그 확인
- 플랫폼별 빌드 요구사항 확인

## 배포 전략

### 1. PWA 우선 전략 (권장)

**주요 배포 방식**: Vercel, Netlify 등에 Next.js 앱을 배포하여 PWA로 제공

**장점**:
- 사용자가 브라우저에서 바로 사용 가능
- 설치 불필요, 업데이트 자동
- 모든 플랫폼(Windows, macOS, Linux, iOS, Android) 지원
- 배포 및 유지보수 간단

**Electron 앱 제공 방식**:
- GitHub Releases에서 다운로드 링크 제공
- "고급 기능이 필요하신가요? 데스크톱 앱 다운로드" 안내
- 버전별 릴리스 노트 제공

### 2. 사용자 안내 예시

**웹사이트 메인 페이지**:
```
Fotion - 브라우저에서 바로 시작하세요!
[지금 시작하기] (PWA 링크)

파워 유저이신가요?
글로벌 단축키를 사용하려면 데스크톱 앱을 다운로드하세요.
[macOS 다운로드] [Windows 다운로드] [Linux 다운로드]
```

**앱 내 안내** (Settings 탭):
```typescript
// SettingsTab.tsx에 추가 예시
{!isElectron() && (
  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <h3 className="font-semibold mb-2">💡 글로벌 단축키를 사용하고 싶으신가요?</h3>
    <p className="text-sm mb-3">
      데스크톱 앱을 설치하면 어디서든 Fotion을 제어할 수 있습니다.
    </p>
    <a href="/downloads" className="text-primary-600 hover:underline">
      데스크톱 앱 다운로드 →
    </a>
  </div>
)}
```

### 3. GitHub Releases 배포 플로우

**자동 빌드 및 배포** (GitHub Actions 예시):

1. 새 버전 태그 생성: `git tag v1.0.0 && git push --tags`
2. GitHub Actions가 자동으로 실행:
   - macOS, Windows, Linux 빌드
   - GitHub Release 생성
   - 빌드 결과물 업로드

**설정 파일 예시** (`.github/workflows/release.yml` - 향후 구현):
```yaml
name: Release Electron App
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm electron:build
      - uses: softprops/action-gh-release@v1
```

### 4. 타이틀바 UI 개선

Electron 앱에서는 플랫폼별로 다른 타이틀바 스타일을 사용합니다:

**macOS**:
- `titleBarStyle: 'hiddenInset'` - 트래픽 라이트 버튼만 표시
- 앱 콘텐츠가 타이틀바 영역으로 확장
- CSS `padding-top: 28px`로 트래픽 라이트 버튼과 겹침 방지

**Windows/Linux**:
- 기본 타이틀바 사용 (`frame: true`)
- 네이티브 최소화/최대화/닫기 버튼
- CSS `padding-top: 32px`로 여백 추가

**자동 감지**:
- `ElectronDetector` 컴포넌트가 실행 환경을 감지
- `body.electron-app.platform-darwin` 등의 클래스 자동 추가
- CSS가 플랫폼별로 다른 여백 적용

## 향후 개발 계획

- [ ] 사용자 정의 단축키 설정 UI
- [ ] 시스템 트레이 아이콘
- [ ] 백그라운드에서 타이머 실행
- [ ] 자동 업데이트 (electron-updater)
- [ ] 알림 (Notification API)
- [ ] 메뉴 바 통합
- [ ] GitHub Actions 자동 빌드 설정
- [ ] 코드 사이닝 (macOS notarization, Windows signing)

## 참고 자료

- [Electron 공식 문서](https://www.electronjs.org/docs)
- [electron-builder 문서](https://www.electron.build/)
- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
