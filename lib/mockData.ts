import { Task, FocusSession } from '@/types'

/**
 * 샘플 Task 데이터 (할 일 목록)
 * - 날짜/시간이 있는 작업: 외부 연동 또는 내부에서 일정이 정해진 작업
 * - 날짜/시간이 없는 작업: 미분류 (외부 연동에서 날짜가 없을 때 등)
 */
export const mockTasks: Task[] = [
  // 오늘 날짜, 시간 지정된 작업들
  {
    id: '1',
    title: '주간 스탠드업 미팅',
    content: '팀 전체 주간 진행 상황 공유',
    status: 'todo',
    priority: 'high',
    source: 'internal',
    scheduledDate: new Date(),
    scheduledTime: '09:00',
    estimatedDuration: 30,
    tags: ['회의'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: '디자인 시스템 구축',
    content: 'Figma에서 컴포넌트 라이브러리 구축',
    status: 'in_progress',
    priority: 'high',
    source: 'notion',
    scheduledDate: new Date(),
    scheduledTime: '10:30',
    estimatedDuration: 120,
    tags: ['디자인', '개발'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'API 엔드포인트 개발',
    content: '사용자 인증 관련 REST API 구현',
    status: 'todo',
    priority: 'high',
    source: 'linear',
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    estimatedDuration: 180,
    tags: ['개발', '백엔드'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: '코드 리뷰 - PR #145',
    content: '새로운 인증 플로우 검토',
    status: 'todo',
    priority: 'medium',
    source: 'internal',
    scheduledDate: new Date(),
    scheduledTime: '16:00',
    estimatedDuration: 45,
    tags: ['리뷰'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // 내일 날짜 작업들
  {
    id: '5',
    title: '클라이언트 미팅',
    content: '프로젝트 진행 상황 보고 및 피드백 수렴',
    status: 'todo',
    priority: 'high',
    source: 'notion',
    scheduledDate: getTomorrowDate(),
    scheduledTime: '10:00',
    estimatedDuration: 60,
    tags: ['회의', '클라이언트'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: '데이터베이스 마이그레이션',
    content: 'PostgreSQL 스키마 업데이트 및 데이터 이전',
    status: 'todo',
    priority: 'high',
    source: 'linear',
    scheduledDate: getTomorrowDate(),
    scheduledTime: '14:00',
    estimatedDuration: 120,
    tags: ['인프라', 'DB'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // 날짜만 있고 시간 없는 작업 (종일 작업 또는 시간 미정)
  {
    id: '7',
    title: '월간 보고서 작성',
    content: '이번 달 성과 및 다음 달 계획 정리',
    status: 'todo',
    priority: 'medium',
    source: 'notion',
    scheduledDate: getDateInFuture(3),
    estimatedDuration: 90,
    tags: ['문서', '보고'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // 내부 작업 (날짜/시간 없음) - 미분류에 표시되지 않음
  {
    id: '8',
    title: '블로그 포스트 작성',
    content: 'Next.js App Router 마이그레이션 경험 공유',
    status: 'todo',
    priority: 'low',
    source: 'internal',
    estimatedDuration: 180,
    tags: ['블로그', '작성'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // 미분류 작업들 (외부 연동 - 날짜/시간 없음 - Backlog에 표시)
  {
    id: '9',
    title: 'UI 컴포넌트 리팩토링',
    content: '공통 컴포넌트 추출 및 재사용성 개선',
    status: 'todo',
    priority: 'medium',
    source: 'linear',
    estimatedDuration: 240,
    tags: ['개발', '리팩토링'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    title: '성능 최적화 연구',
    content: 'React 렌더링 최적화 방법 조사',
    status: 'todo',
    priority: 'low',
    source: 'notion',
    estimatedDuration: 120,
    tags: ['연구', '성능'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '11',
    title: '라이브러리 업데이트 검토',
    content: '의존성 최신 버전 확인 및 호환성 테스트',
    status: 'todo',
    priority: 'low',
    source: 'todoist',
    estimatedDuration: 60,
    tags: ['유지보수'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '12',
    title: '디자인 토큰 정리',
    content: '색상, 타이포그래피, 간격 등 디자인 토큰 표준화',
    status: 'todo',
    priority: 'medium',
    source: 'notion',
    estimatedDuration: 90,
    tags: ['디자인', '시스템'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '13',
    title: '테스트 커버리지 개선',
    content: '핵심 비즈니스 로직에 대한 단위 테스트 추가',
    status: 'todo',
    priority: 'medium',
    source: 'linear',
    estimatedDuration: 180,
    tags: ['테스트', '품질'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '14',
    title: '접근성 개선 작업',
    content: 'ARIA 레이블 추가 및 키보드 네비게이션 개선',
    status: 'todo',
    priority: 'medium',
    source: 'linear',
    estimatedDuration: 150,
    tags: ['접근성', 'a11y'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// 헬퍼 함수들
function getTomorrowDate(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

function getDateInFuture(days: number): Date {
  const future = new Date()
  future.setDate(future.getDate() + days)
  return future
}

/**
 * 샘플 FocusSession 데이터 (집중 모드 기록)
 * - 오늘과 최근 며칠간의 집중 세션 기록
 */
export const mockFocusSessions: FocusSession[] = [
  // 오늘 완료된 세션들
  {
    id: 'session-1',
    taskId: '1',
    taskTitle: '주간 스탠드업 미팅',
    startTime: getTodayTime(9, 0),
    endTime: getTodayTime(9, 32),
    duration: 32 * 60 * 1000, // 32분
    isCompleted: true,
    mode: 'timer',
    targetDuration: 30 * 60 * 1000, // 30분 목표
  },
  {
    id: 'session-2',
    taskId: '2',
    taskTitle: '디자인 시스템 구축',
    startTime: getTodayTime(10, 30),
    endTime: getTodayTime(12, 15),
    duration: 105 * 60 * 1000, // 1시간 45분
    isCompleted: false, // 타이머 완료 전에 종료
    mode: 'timer',
    targetDuration: 120 * 60 * 1000, // 2시간 목표
  },
  {
    id: 'session-3',
    taskId: '3',
    taskTitle: 'API 엔드포인트 개발',
    startTime: getTodayTime(14, 0),
    endTime: getTodayTime(16, 45),
    duration: 165 * 60 * 1000, // 2시간 45분
    isCompleted: false,
    mode: 'stopwatch', // 스톱워치 모드
  },

  // 어제 완료된 세션들
  {
    id: 'session-4',
    taskId: '2',
    taskTitle: '디자인 시스템 구축',
    startTime: getYesterdayTime(9, 30),
    endTime: getYesterdayTime(11, 0),
    duration: 90 * 60 * 1000, // 1시간 30분
    isCompleted: true,
    mode: 'timer',
    targetDuration: 90 * 60 * 1000,
  },
  {
    id: 'session-5',
    taskId: '4',
    taskTitle: '코드 리뷰 - PR #145',
    startTime: getYesterdayTime(14, 0),
    endTime: getYesterdayTime(14, 47),
    duration: 47 * 60 * 1000, // 47분
    isCompleted: true,
    mode: 'timer',
    targetDuration: 45 * 60 * 1000,
  },
  {
    id: 'session-6',
    taskId: '9',
    taskTitle: 'UI 컴포넌트 리팩토링',
    startTime: getYesterdayTime(15, 30),
    endTime: getYesterdayTime(17, 45),
    duration: 135 * 60 * 1000, // 2시간 15분
    isCompleted: false,
    mode: 'stopwatch',
  },

  // 2일 전 세션들
  {
    id: 'session-7',
    taskId: '1',
    taskTitle: '주간 스탠드업 미팅',
    startTime: getDaysAgoTime(2, 9, 0),
    endTime: getDaysAgoTime(2, 9, 28),
    duration: 28 * 60 * 1000, // 28분
    isCompleted: false,
    mode: 'timer',
    targetDuration: 30 * 60 * 1000,
  },
  {
    id: 'session-8',
    taskId: '10',
    taskTitle: '성능 최적화 연구',
    startTime: getDaysAgoTime(2, 10, 30),
    endTime: getDaysAgoTime(2, 12, 15),
    duration: 105 * 60 * 1000, // 1시간 45분
    isCompleted: true,
    mode: 'timer',
    targetDuration: 120 * 60 * 1000,
  },

  // 3일 전 세션들
  {
    id: 'session-9',
    taskId: '13',
    taskTitle: '테스트 커버리지 개선',
    startTime: getDaysAgoTime(3, 14, 0),
    endTime: getDaysAgoTime(3, 16, 30),
    duration: 150 * 60 * 1000, // 2시간 30분
    isCompleted: false,
    mode: 'stopwatch',
  },
  {
    id: 'session-10',
    taskId: '12',
    taskTitle: '디자인 토큰 정리',
    startTime: getDaysAgoTime(3, 16, 45),
    endTime: getDaysAgoTime(3, 18, 15),
    duration: 90 * 60 * 1000, // 1시간 30분
    isCompleted: true,
    mode: 'timer',
    targetDuration: 90 * 60 * 1000,
  },

  // 일주일 전 세션
  {
    id: 'session-11',
    taskId: '3',
    taskTitle: 'API 엔드포인트 개발',
    startTime: getDaysAgoTime(7, 10, 0),
    endTime: getDaysAgoTime(7, 12, 50),
    duration: 170 * 60 * 1000, // 2시간 50분
    isCompleted: false,
    mode: 'timer',
    targetDuration: 180 * 60 * 1000,
  },
]

// 시간 헬퍼 함수들
function getTodayTime(hours: number, minutes: number): Date {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

function getYesterdayTime(hours: number, minutes: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function getDaysAgoTime(daysAgo: number, hours: number, minutes: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date
}

// 하위 호환성을 위해 mockTasks를 mockWeeklyTasks로도 export
export const mockWeeklyTasks: Task[] = mockTasks
