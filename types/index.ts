// Task 관련 타입 (할 일 목록)
export interface Task {
  id: string
  title: string
  content?: string // WYSIWYG 에디터 내용 (JSON 또는 HTML)
  status: 'todo' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  source: 'internal' | 'notion' | 'todoist' | 'linear' | 'google-calendar' // 작업 출처
  estimatedDuration?: number // 예상 소요 시간 (분)

  // 일정 (외부 연동에서 가져올 수 있음)
  scheduledDate?: Date // 시작일 또는 종료일
  scheduledTime?: string // "09:00" 형식

  // 메타데이터
  createdAt: Date
  updatedAt: Date
}

// 타이머 관련 타입
export type TimerMode = 'timer' | 'stopwatch'

export interface TimerState {
  isRunning: boolean
  mode: TimerMode
  startTime: number // timestamp
  duration?: number // 타이머 모드일 때 목표 시간 (밀리초)
  elapsedTime: number // 경과 시간 (밀리초)
  taskId?: string // 현재 집중하고 있는 task
  sessionId?: string // FocusSession ID
}

// 집중 세션 기록 (시각화 탭에 표시되는 데이터)
export interface FocusSession {
  id: string
  taskId: string
  taskTitle: string // Task 제목 스냅샷 (Task 삭제되어도 기록 유지)
  startTime: Date // 집중 시작 시간
  endTime: Date | null // 집중 종료 시간
  duration: number // 실제 집중한 시간 (밀리초)
  isCompleted: boolean // 타이머 완료 여부 (중간에 멈추면 false)
  mode: TimerMode // 타이머 or 스톱워치
  targetDuration?: number // 타이머 모드일 때 목표 시간 (밀리초)
}

// 탭 관련 타입
export type TabType = 'visualization' | 'tasks' | 'statistics' | 'settings' | 'focus'

export interface AppTab {
  id: string
  type: TabType
  title: string
  isPinned: boolean // 고정 탭 (닫기 불가)

  // 집중 모드 탭 전용
  taskId?: string
  timerState?: TimerState
}

export type VisualizationView = 'hourly' | 'daily' | 'monthly'

// 설정 관련 타입
export interface UserSettings {
  // 타이머 설정
  defaultTimerDuration: number // 기본 타이머 시간 (분)

  // OAuth 설정
  googleConnected: boolean
  notionConnected: boolean
  todoistConnected: boolean
  linearConnected: boolean
}

// 앱 전역 상태
export interface AppState {
  tabs: AppTab[]
  activeTabId: string
  currentView: VisualizationView
  tasks: Task[]
  focusSessions: FocusSession[]
  settings: UserSettings
}
