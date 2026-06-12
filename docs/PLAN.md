# Fotion — Plan

- **문제**: Rize.io는 훌륭하지만 폐쇄형 + 월 구독 + 내 활동 데이터가 남의 서버에 있다. ActivityWatch는 오픈소스지만 엔진일 뿐, 매일 열고 싶은 제품이 아니다.
- **해결**: ActivityWatch를 데이터 엔진으로 재사용하고, 그 위에 Rize급 UI(Tier 1)와 사용자 자신의 Claude/ChatGPT 구독으로 동작하는 AI 기능(Tier 2+)을 얹는 local-first 오픈소스 데스크톱 앱.
- **산출물**: Tauri 2 + React 데스크톱 앱. 1차 범위는 read-only 대시보드 3종(데일리/타임라인/주간) + 설정.

---

## Context

rize.io 대안 오픈소스 프로젝트. 수집은 ActivityWatch(로컬 SQLite + REST API)에 위임하고, Fotion은 조회 UI와 파생 분석에 집중한다. 차별화 컨셉은 **BYO-AI** — 별도 API 키 과금 없이 사용자가 이미 보유한 구독의 CLI(`claude -p`, `codex exec`)를 로컬에서 호출한다. 2026-06-12 로컬 실측으로 AW의 스키마·heartbeat 동작·쿼리 API를 검증 완료.

## Roadmap (Tier)

| Tier | 범위 | 상태 |
|---|---|---|
| **1** | read-only 대시보드: 데일리 / 타임라인 / 주간 / 설정 | **착수** |
| 2 | 파생 레이어: 카테고리 규칙, AI 보조 분류(BYO-AI 데뷔), 세션 감지, Focus Score | 후순위 |
| 3 | 개입: 메뉴바 위젯, nudge(예: "유튜브 30분 연속 → 그만 보기 제안"), 휴식 리마인더 | 후순위 |
| 4 | AI 코칭: 데일리 요약, 로컬 히스토리 Q&A | 후순위 |

## File Tree (Tier 1 목표 구조)

```
Fotion/
├── README.md                 # 포지셔닝 + 로드맵 + 개발 가이드 (신규)
├── docs/
│   └── PLAN.md               # 이 문서
├── src/                      # React UI (신규)
│   ├── views/
│   │   ├── daily/            # T1-1 데일리 대시보드
│   │   ├── timeline/         # T1-2 타임라인 뷰
│   │   ├── weekly/           # T1-3 주간 뷰
│   │   └── settings/         # T1-4 설정
│   ├── components/           # 공용 컴포넌트
│   └── lib/aw/               # AW REST/query API 클라이언트 (신규)
└── src-tauri/                # Rust 셸: HTTP 프록시, 트레이(Tier 3 대비) (신규)
```

## Detail

### 제품 원칙

1. **Local-first** — 원본 데이터는 AW 로컬 SQLite가 유일한 진실. Fotion 클라우드/계정 없음.
2. **BYO-AI** — AI는 항상 옵션. 사용자 구독 CLI만 사용, API 키 번들 금지, 모든 프롬프트는 UI에서 열람 가능한 로그로 남김.
3. **Product-grade UI** — stock AW 대비 Fotion의 존재 이유는 "매일 아침 열고 싶은 화면".

### Tier 1 스펙

**T1-1 데일리 대시보드** — 헤드라인 total active time(window ∩ not-afk), 앱별 막대 리스트(아이콘·시간·%), 24시간 히트맵, 앱별 top 창제목(확장형). AW 쿼리 API의 `merge_events_by_keys`로 서버측 집계 (실측 검증됨).

**T1-2 타임라인 뷰** — 하루를 시간축으로 펼쳐 앱 색깔 블록 렌더. AFK 구간은 빗금/공백. 호버 툴팁(앱·제목·시작-끝). 실측 결과 raw 이벤트 중앙값이 2.1초라 저줌에서는 10초 미만 이벤트를 이웃에 시각 병합.

**T1-3 주간 뷰** — 7일 스택 막대(top-N 앱 + other), 일별 추이, 주간 합계/일평균. 쿼리 API `timeperiods`에 7개 기간을 넘겨 한 번에 조회.

**T1-4 설정** — AW 서버 URL(기본 `localhost:5600`), 연결 상태 + "AW 미실행" 안내 empty state, day boundary(기본 04:00).

**Non-goals (Tier 1)** — 카테고리/세션/점수/AI/메뉴바/알림/브라우저 탭 상세(aw-watcher-web 필요)/Windows·Linux 패키징 없음.

### 아키텍처 결정

| 항목 | 결정 | 근거 |
|---|---|---|
| 셸 | **Tauri 2** | Tier 3-4에 필요한 트레이·알림·로컬 프로세스 호출(claude/codex)을 가볍게 충족. Rust측 HTTP로 AW CORS 회피 |
| UI | React + TS + Vite | 표준. 타임라인은 커스텀 SVG/Canvas |
| 데이터 | AW read-only (REST/query API), Tier 1에선 자체 DB 없음 | SQLite 직접 읽기 금지(서버가 계속 쓰는 중 + Python/Rust 서버 간 경로 상이) |
| 파생 DB | Tier 2에서 자체 SQLite 도입 | 분류·세션·점수는 Fotion 소유 데이터 |

### AW 실측 사실 (2026-06-12, v0.13.2)

- 스키마는 `bucketmodel` + `eventmodel` 2테이블, 이벤트 본문은 `datastr`에 JSON 문자열.
- **마지막 이벤트는 mutable** — heartbeat가 마지막 row의 duration을 in-place 갱신 (19.9s → 49.9s 같은 row에서 관측). 증분 동기화 시 "최근 N분 재조회" 전략 필수, 이벤트 id는 커서로 못 씀.
- 이벤트 밀도 ~10개/분(잦은 전환 시), 용량은 연간 수십 MB 수준으로 비문제.
- 버킷 id에 hostname이 박혀 있으므로 하드코딩 금지, `GET /api/0/buckets/`로 디스커버리.

### 1차 마일스톤 (이 플랜 승인 후)

1. Tauri 2 + React + Vite 스캐폴드
2. `lib/aw` 클라이언트 (info/buckets/events/query + 헬스체크)
3. T1-1 데일리 대시보드 1화면 end-to-end
4. 이후 T1-2 → T1-3 → T1-4 순

## Monitoring Plan

서비스가 아닌 로컬 데스크톱 앱이라 운영 모니터링은 해당 없음. 개발 단계 검증 기준:

- **What to check**: 각 뷰의 수치가 AW 자체 웹 UI(`localhost:5600`)와 일치하는지 — total active time, 앱별 합계를 동일 날짜로 비교.
- **Success signal**: AW 웹 UI 대비 합계 오차 < 1% (heartbeat 갱신 타이밍 차이 허용).
- **How**: 개발 중 `curl POST /api/0/query/` 결과와 화면 표시값 대조. 마지막-이벤트 mutable 처리는 "대시보드 열어둔 채 1분 대기 → 현재 앱 시간이 증가하는지"로 확인.
- **When**: 각 뷰 구현 완료 시점마다 1회 + Tier 1 마감 시 전체 회귀 1회.
