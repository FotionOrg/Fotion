# Google Calendar 연동 설정 가이드

Fotion2에서 Google Calendar를 연동하여 캘린더 이벤트를 작업으로 자동 가져오는 방법입니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 1.2 Google Calendar API 활성화
1. 좌측 메뉴에서 **API 및 서비스** > **라이브러리** 선택
2. "Google Calendar API" 검색
3. **사용** 버튼 클릭

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. 좌측 메뉴에서 **API 및 서비스** > **사용자 인증 정보** 선택
2. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름 입력 (예: "Fotion2 Local Dev")
5. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. **만들기** 클릭
7. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

## 2. 환경 변수 설정

### 2.1 `.env.local` 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

### 2.2 환경 변수 입력
`.env.local` 파일을 열어 다음 값 입력:

```env
# Google Calendar API
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth (임의의 긴 문자열)
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000
```

**NEXTAUTH_SECRET 생성 방법:**
```bash
openssl rand -base64 32
```

## 3. 개발 서버 재시작

환경 변수를 적용하기 위해 개발 서버 재시작:

```bash
npm run dev
```

## 4. Google Calendar 연동 사용

### 4.1 연결하기
1. 앱 실행 후 **작업 관리** 탭 이동
2. 우측 사이드바에서 **Google Calendar** 카드 찾기
3. **연결하기** 버튼 클릭
4. Google 계정 선택 및 권한 승인
5. 자동으로 앱으로 리디렉션됨

### 4.2 이벤트 동기화
1. **이번 주 일정 동기화** 버튼 클릭
2. 이번 주의 Google Calendar 이벤트가 작업으로 자동 추가됨
3. 동기화 결과 확인 (예: "✅ 5개의 작업을 가져왔습니다.")

### 4.3 토큰 관리
- **자동 갱신**: 토큰이 만료되면 자동으로 refresh token을 사용하여 갱신
- **저장 위치**: 브라우저 LocalStorage (키: `google_calendar_token`)
- **연결 해제**: Google Calendar 카드에서 **연결 해제** 버튼 클릭

## 5. 보안 고려사항 (프로덕션 배포 시)

### 현재 MVP 구현의 한계
- ⚠️ OAuth 토큰이 LocalStorage에 저장됨 (브라우저에서 접근 가능)
- ⚠️ 토큰이 URL 파라미터로 전달됨 (브라우저 히스토리에 남음)

### 프로덕션 권장 사항
1. **서버 사이드 세션 사용**
   - NextAuth.js 또는 유사한 인증 라이브러리 사용
   - 토큰을 서버 DB 또는 암호화된 쿠키에 저장

2. **HTTPS 사용**
   - 프로덕션에서는 반드시 HTTPS 사용
   - Google Cloud Console에서 승인된 리디렉션 URI를 HTTPS로 변경

3. **환경 변수 보호**
   - `.env.local` 파일을 절대 Git에 커밋하지 않기
   - 프로덕션에서는 Vercel, Railway 등의 환경 변수 관리 사용

## 6. 문제 해결

### "인증 URL을 가져오는데 실패했습니다"
- `.env.local` 파일의 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET` 확인
- 개발 서버 재시작

### "동기화 실패: Token expired and no refresh token available"
- Google Calendar 연결 해제 후 다시 연결
- 처음 인증 시 `prompt: 'consent'`를 사용하여 refresh token 받음

### "승인되지 않은 리디렉션 URI"
- Google Cloud Console에서 승인된 리디렉션 URI 확인:
  ```
  http://localhost:3000/api/auth/google/callback
  ```
- 포트 번호가 다른 경우 (예: 3001) URI 추가

## 7. API 할당량

Google Calendar API의 무료 할당량:
- **읽기**: 하루 1,000,000 요청
- 일반적인 개인 사용에는 충분함

더 많은 정보: [Google Calendar API 문서](https://developers.google.com/calendar/api/guides/overview)
