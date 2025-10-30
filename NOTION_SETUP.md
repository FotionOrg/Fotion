# Notion 연동 설정 가이드

## 🎯 개요

Fotion과 Notion을 연동하여 Notion 데이터베이스의 작업을 자동으로 동기화할 수 있습니다.
**기존 Notion 워크스페이스에 Property 2개만 추가하면 바로 사용 가능합니다.**

---

## 📋 사전 준비

1. Notion 계정 (무료 플랜 가능)
2. 동기화할 데이터베이스 (기존 것 사용 가능)

---

## 🔧 1단계: Notion Integration 생성

### 1. Notion Developers 페이지 접속
https://www.notion.so/my-integrations

### 2. New Integration 생성
1. "+ New integration" 버튼 클릭
2. Integration 정보 입력:
   - **Name**: `Fotion`
   - **Logo**: (선택사항)
   - **Associated workspace**: 사용할 워크스페이스 선택
   - **Type**: `Public` 선택 (OAuth 사용을 위해)

3. "Submit" 클릭

### 3. OAuth Settings 구성
Integration이 생성되면 자동으로 설정 페이지로 이동합니다.

#### Capabilities 설정:
- ✅ Read content
- ✅ Update content
- ✅ Insert content
- ⬜ Read comments (선택사항)
- ⬜ Insert comments (선택사항)

#### Redirect URIs 추가:
1. "OAuth Domain & URIs" 섹션으로 이동
2. "Redirect URIs" 입력란에 다음 추가:
   ```
   http://localhost:3001/api/auth/notion/callback
   ```

   프로덕션 환경일 경우:
   ```
   https://your-domain.com/api/auth/notion/callback
   ```

3. "Add URI" 클릭

### 4. Secrets 복사
Integration 설정 페이지에서:

1. **OAuth client ID** 복사
   - "Secrets" 섹션에서 "Client ID" 확인
   - 형식: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

2. **OAuth client secret** 복사
   - "Client secret" 옆의 "Show" 클릭
   - Secret 복사 (한 번만 표시됨!)
   - 형식: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **중요**: Client Secret은 한 번만 표시되므로 반드시 안전한 곳에 저장하세요!

---

## 🔐 2단계: 환경 변수 설정

### 1. `.env.local` 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성합니다.

### 2. Notion Credentials 추가
```bash
# 앱 기본 설정
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Notion API 설정
NEXT_PUBLIC_NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
```

**값 설정:**
- `NEXT_PUBLIC_NOTION_CLIENT_ID`: 위에서 복사한 OAuth Client ID
- `NOTION_CLIENT_SECRET`: 위에서 복사한 OAuth Client Secret
- `NEXT_PUBLIC_APP_URL`: 개발 환경에서는 `http://localhost:3001`, 프로덕션에서는 실제 도메인

### 3. 개발 서버 재시작
```bash
npm run dev
```

---

## 📝 3단계: Notion 데이터베이스 준비

### 기존 데이터베이스에 Property 추가

Fotion과 동기화하려는 Notion 데이터베이스를 열고 다음 2개의 Property를 추가합니다:

#### Property 1: Fotion Sync
1. 데이터베이스 우측 상단 "..." (Properties) 클릭
2. "+ New property" 클릭
3. Property 설정:
   - **Name**: `Fotion Sync`
   - **Type**: `Checkbox`
4. "Create" 클릭

**용도**: 이 체크박스를 체크한 항목만 Fotion과 동기화됩니다.

#### Property 2: Fotion ID
1. 다시 "+ New property" 클릭
2. Property 설정:
   - **Name**: `Fotion ID`
   - **Type**: `Text`
3. "Create" 클릭

**용도**: Fotion이 자동으로 고유 ID를 저장합니다. (사용자는 직접 입력하지 않음)

---

## 🚀 4단계: Fotion에서 연동

### 1. Fotion 앱 실행
```bash
npm run dev
```
http://localhost:3001 접속

### 2. 작업 관리 탭으로 이동
하단 탭 바에서 "작업 관리" 탭 클릭

### 3. Notion 카드에서 "연동 시작" 클릭
"현재 활성화된 연동" 섹션의 Notion 카드에서 "연결하기" 버튼 클릭

### 4. Notion 인증
1. Notion 로그인 페이지로 리디렉션됩니다
2. Fotion이 요청하는 권한 확인:
   - 페이지 읽기
   - 페이지 업데이트
   - 페이지 생성
3. "Select pages" 클릭하여 동기화할 페이지/데이터베이스 선택
4. "Allow access" 클릭

### 5. 데이터베이스 선택
1. Fotion으로 자동 리디렉션됩니다
2. "데이터베이스 선택" 드롭다운에서 동기화할 데이터베이스 선택
3. Property 확인 상태가 표시됩니다:
   - ✅ Fotion Sync (Checkbox)
   - ✅ Fotion ID (Text)

⚠️ Property가 없다면 노란색 경고와 함께 표시됩니다. 3단계로 돌아가 Property를 추가하세요.

### 6. 동기화 시작
1. "동기화 시작" 버튼 클릭
2. Notion에서 "Fotion Sync"가 체크된 항목들이 자동으로 가져와집니다
3. 결과 메시지 확인: "✅ X개의 작업을 가져왔습니다."

---

## 📊 사용 방법

### 선택적 동기화
Notion 데이터베이스의 **모든 항목이 아닌, "Fotion Sync" 체크박스를 체크한 항목만** 동기화됩니다.

**동기화할 항목**:
1. Notion에서 해당 페이지 열기
2. "Fotion Sync" 체크박스 체크
3. Fotion에서 "동기화 시작" 클릭

**동기화 중단할 항목**:
1. Notion에서 "Fotion Sync" 체크박스 해제
2. 다음 동기화 시 Fotion에서 제거됩니다

### 자동 동기화 (향후 구현 예정)
현재는 수동 동기화만 지원하며, 향후 업데이트에서 자동 동기화 기능이 추가될 예정입니다.

### 양방향 동기화 (향후 구현 예정)
- Fotion → Notion 방향 동기화 (작업 상태, 날짜 업데이트 등)
- 현재는 Notion → Fotion 방향만 지원

---

## 🔄 동기화 매핑

Notion의 Property가 Fotion의 Task 필드로 변환됩니다:

| Notion Property | Fotion Task | 설명 |
|----------------|-------------|------|
| Title | title | 작업 제목 |
| Status (Select) | status | todo/in_progress/completed |
| Date (Date) | scheduledDate | 예정 날짜 |
| Priority (Select) | priority | low/medium/high |
| Fotion Sync (Checkbox) | - | 동기화 여부 제어 |
| Fotion ID (Text) | id | Fotion 내부 ID |

### Status 매핑 규칙
Notion의 Status Select 값이 다음과 같이 변환됩니다:
- `Todo`, `Not Started`, `Backlog` → `todo`
- `In Progress`, `Doing`, `Started` → `in_progress`
- `Done`, `Completed`, `Finished` → `completed`

### Priority 매핑 규칙
- `High`, `Urgent` → `high`
- `Medium`, `Normal` → `medium`
- `Low` → `low`

---

## ❓ 자주 묻는 질문 (FAQ)

### Q: 여러 데이터베이스를 연동할 수 있나요?
A: 현재 버전에서는 하나의 데이터베이스만 선택 가능합니다. 향후 업데이트에서 다중 데이터베이스 지원 예정입니다.

### Q: Notion 페이지 본문도 동기화되나요?
A: 현재는 데이터베이스 Property만 동기화됩니다. 페이지 본문 동기화는 향후 추가 예정입니다.

### Q: 동기화가 실패하면 어떻게 하나요?
A: 다음을 확인하세요:
1. `.env.local` 파일의 Credentials가 정확한지
2. Notion Integration에서 Redirect URI가 올바르게 설정되었는지
3. Notion에서 페이지 접근 권한이 부여되었는지
4. "Fotion Sync", "Fotion ID" Property가 정확히 추가되었는지

### Q: 기존 작업을 Notion으로 보낼 수 있나요?
A: 현재는 Notion → Fotion 방향만 지원합니다. 양방향 동기화는 향후 추가 예정입니다.

### Q: 토큰이 만료되면?
A: Notion OAuth 토큰은 만료되지 않습니다. 단, 사용자가 Integration 연결을 해제하면 재인증이 필요합니다.

---

## 🔒 보안 고려사항

### 개발 환경
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env.local`이 포함되어 있는지 확인하세요

### 프로덕션 환경
- 환경 변수를 서버 환경 변수로 설정하세요 (Vercel, AWS 등)
- HTTPS 사용 필수
- Redirect URI를 프로덕션 도메인으로 업데이트하세요
- Client Secret을 안전하게 보관하세요

---

## 🐛 문제 해결

### 연결 오류
```
❌ 연결 실패: access_denied
```
**해결**: Notion에서 권한을 거부했습니다. 다시 "연결하기"를 클릭하고 권한을 승인하세요.

### 토큰 파싱 실패
```
❌ 토큰 파싱 실패
```
**해결**: 브라우저 쿠키와 localStorage를 삭제하고 다시 시도하세요.

### Property 없음 경고
```
⚠️ 필요한 Property를 추가해주세요
```
**해결**: 3단계로 돌아가 "Fotion Sync"와 "Fotion ID" Property를 추가하세요.

### 데이터베이스가 목록에 없음
**해결**: Notion 인증 시 해당 데이터베이스를 "Select pages"에서 선택했는지 확인하세요.
선택하지 않았다면:
1. Fotion에서 "연결 해제" 클릭
2. 다시 "연결하기" 클릭
3. "Select pages"에서 데이터베이스 선택
4. "Allow access" 클릭

---

## 📚 추가 리소스

- [Notion API 공식 문서](https://developers.notion.com/)
- [Notion OAuth Guide](https://developers.notion.com/docs/authorization)
- [Fotion 통합 연동 가이드](./INTEGRATIONS_SETUP.md)

---

## 🆘 지원

문제가 계속되면 GitHub Issues에 문의하세요:
https://github.com/your-repo/fotion/issues
