# Fotion 외부 서비스 연동 가이드

## 🎯 핵심 원칙

**기존 프로젝트에 태그만 추가하면 자동으로 동기화됩니다.**

각 서비스마다 특정 태그/라벨/Property를 추가하면 Fotion이 자동으로 인식하여 동기화합니다.
새로운 워크스페이스나 프로젝트를 만들 필요가 없습니다!

---

## 📝 Notion 연동

### 필요한 설정
기존 Notion 데이터베이스에 **2개의 Property만 추가**하면 됩니다.

### 단계별 설정 방법

#### 1. Fotion 앱에서 Notion 연결
1. Fotion 앱 → "작업 관리" 탭
2. Notion 카드에서 "연동 시작" 클릭
3. OAuth 인증으로 Notion 워크스페이스 연결
4. 동기화할 데이터베이스 선택

#### 2. Notion에서 Property 추가
선택한 데이터베이스에 다음 2개 Property를 추가합니다:

**Property 1: Fotion Sync**
- 타입: `Checkbox`
- 용도: 이 체크박스를 체크한 항목만 Fotion과 동기화됩니다

**Property 2: Fotion ID**
- 타입: `Text`
- 용도: Fotion이 자동으로 ID를 부여 (사용자는 건드리지 않음)

#### 3. Property 추가 방법 (상세)
```
1. Notion 데이터베이스 우측 상단 "..." 클릭
2. "Properties" 메뉴 선택
3. "+ New property" 클릭
4. Property 이름: "Fotion Sync"
5. Property 타입: "Checkbox" 선택
6. 생성 완료

7. 다시 "+ New property" 클릭
8. Property 이름: "Fotion ID"
9. Property 타입: "Text" 선택
10. 생성 완료
```

#### 4. 동기화 시작
1. Fotion 앱으로 돌아가기
2. "동기화 시작" 버튼 클릭
3. Notion에서 "Fotion Sync"가 체크된 항목들이 자동으로 가져와집니다

### 💡 사용 팁
- **선택적 동기화**: 모든 항목을 동기화할 필요 없이, "Fotion Sync" 체크박스를 체크한 항목만 가져옵니다
- **양방향 동기화**: Fotion에서 수정한 내용이 Notion에 자동 반영됩니다 (옵션)
- **자동 갱신**: 설정한 주기마다 자동으로 동기화됩니다 (기본: 2시간)

---

## 📐 Linear 연동

### 필요한 설정
Linear에서 **하나의 Label만 생성**하면 됩니다.

### 단계별 설정 방법

#### 1. Fotion 앱에서 Linear 연결
1. Fotion 앱 → "작업 관리" 탭
2. Linear 카드에서 "연동 시작" 클릭
3. OAuth 인증으로 Linear 워크스페이스 연결
4. 동기화할 프로젝트 선택 (전체 또는 특정 프로젝트)

#### 2. Linear에서 Label 생성
Linear에 `fotion-sync` Label을 생성합니다:

```
1. Linear 좌측 하단 Settings (⚙️) 클릭
2. "Labels" 메뉴 선택
3. "Create label" 버튼 클릭
4. Label 이름: "fotion-sync" 입력
5. 원하는 색상 선택 (예: 파란색)
6. "Create" 클릭하여 생성
```

#### 3. 이슈에 Label 추가
동기화하고 싶은 이슈를 열고:
```
1. 이슈 상세 페이지에서 "Labels" 섹션 클릭
2. "fotion-sync" 라벨 선택
3. 저장
```

#### 4. 동기화 시작
1. Fotion 앱으로 돌아가기
2. "동기화 시작" 버튼 클릭
3. `fotion-sync` 라벨이 붙은 이슈들이 자동으로 가져와집니다

### 💡 사용 팁
- **선택적 동기화**: 모든 이슈를 가져오지 않고, `fotion-sync` 라벨이 있는 이슈만 동기화됩니다
- **상태 매핑**: Linear의 Workflow 상태가 Fotion의 작업 상태로 자동 변환됩니다
  - Todo, Backlog → `todo`
  - In Progress, Started → `in_progress`
  - Done, Completed → `completed`
- **자동 갱신**: 설정한 주기마다 자동으로 동기화됩니다 (기본: 1시간)

---

## 📅 Google Calendar 연동

### 필요한 설정
**캘린더만 선택**하면 됩니다. 추가 설정 불필요!

### 단계별 설정 방법

#### 1. Fotion 앱에서 Google 연결
1. Fotion 앱 → "작업 관리" 탭
2. Google Calendar 카드에서 "연동 시작" 클릭
3. Google 계정 선택 및 권한 승인

#### 2. 캘린더 선택
동기화할 캘린더를 선택합니다:
```
□ 내 캘린더 (기본)
□ 업무 캘린더
□ 개인 일정
☑ 프로젝트 A
□ 공유 캘린더
```

#### 3. 필터 설정 (선택사항)
가져올 이벤트를 세밀하게 제어할 수 있습니다:

**참석 상태 필터**
- ☑ 참석 중 (Accepted)
- ☐ 미정 (Tentative)
- ☐ 거절함 (Declined)

**일정 상태 필터**
- ☑ 바쁨 (Busy)
- ☐ 가능 (Available)

**키워드 필터**
- 포함: `[Focus]`, `집중`, `작업`
- 제외: `개인`, `점심`, `회의`

#### 4. 동기화 시작
1. "동기화 시작" 버튼 클릭
2. 이번 주 일정이 Fotion 작업으로 변환됩니다
3. 자동 동기화 주기 설정 (기본: 30분)

### 💡 사용 팁
- **추천 필터**: "참석 중" + "바쁨" 상태만 선택하면 실제로 시간을 할애해야 하는 일정만 가져옵니다
- **키워드 활용**: 캘린더 제목에 `[Focus]`를 붙여서 집중 작업만 선별적으로 가져올 수 있습니다
- **시간 범위**: 기본으로 이번 주 일정만 가져오지만, 설정에서 변경 가능합니다

---

## ⚙️ 동기화 옵션

모든 연동 서비스에서 공통으로 사용 가능한 옵션입니다:

### 자동 동기화 주기
- Notion: 2시간 (변경 가능)
- Linear: 1시간 (변경 가능)
- Google Calendar: 30분 (변경 가능)

### 양방향 동기화 (Notion, Linear만 해당)
- **ON**: Fotion에서 수정한 내용이 원본 서비스에도 반영됩니다
- **OFF**: 원본 서비스 → Fotion 방향으로만 동기화됩니다 (읽기 전용)

### 수동 동기화
자동 동기화 외에도 언제든지 "동기화" 버튼을 클릭하여 즉시 동기화할 수 있습니다.

---

## 🔄 동기화 플로우

### Notion
```
Notion DB [Fotion Sync ✓] → Fotion Task
       ↕ (양방향 동기화 ON 시)
Fotion Task 수정 → Notion DB 업데이트
```

### Linear
```
Linear Issue [fotion-sync 라벨] → Fotion Task
            ↕ (양방향 동기화 ON 시)
Fotion Task 상태 변경 → Linear Issue 상태 업데이트
```

### Google Calendar
```
Google Calendar Event → Fotion Task (읽기 전용)
```

---

## ❓ FAQ

### Q: 기존 데이터를 전부 동기화해야 하나요?
A: 아니요! 필요한 항목에만 태그를 추가하여 선택적으로 동기화할 수 있습니다.

### Q: 동기화를 중단하려면?
A: Notion은 "Fotion Sync" 체크 해제, Linear는 "fotion-sync" 라벨 제거하면 됩니다.

### Q: 여러 데이터베이스/프로젝트를 연동할 수 있나요?
A: 네! 각 서비스마다 여러 데이터베이스/프로젝트를 추가할 수 있습니다.

### Q: OAuth 토큰이 만료되면?
A: Fotion이 자동으로 refresh token을 사용하여 갱신합니다. 재인증 불필요!

### Q: 동기화 충돌이 발생하면?
A: 기본적으로 원본 서비스의 데이터가 우선됩니다. 양방향 동기화 시에는 최신 수정 시간 기준으로 병합됩니다.

---

## 🚀 빠른 시작 체크리스트

### Notion
- [ ] Notion 워크스페이스 연결
- [ ] 데이터베이스 선택
- [ ] "Fotion Sync" (Checkbox) Property 추가
- [ ] "Fotion ID" (Text) Property 추가
- [ ] 동기화할 항목에 체크 추가
- [ ] 동기화 시작

### Linear
- [ ] Linear 워크스페이스 연결
- [ ] 프로젝트 선택
- [ ] "fotion-sync" Label 생성
- [ ] 이슈에 라벨 추가
- [ ] 동기화 시작

### Google Calendar
- [ ] Google 계정 연결
- [ ] 캘린더 선택
- [ ] (선택) 필터 설정
- [ ] 동기화 시작

---

## 💻 개발자 정보

OAuth 설정이 필요한 경우, 각 서비스별 가이드를 참고하세요:
- [Google Calendar OAuth 설정](./GOOGLE_CALENDAR_SETUP.md)
- Notion API 설정 (TBD)
- Linear API 설정 (TBD)
