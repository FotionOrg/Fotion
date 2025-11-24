// 작업 블록 색상 팔레트 (8개로 단순화)
export const TASK_COLORS = [
  { name: 'red', label: 'Red', value: '#EF4444', bg: 'bg-red-500', text: 'text-white' },
  { name: 'orange', label: 'Orange', value: '#F97316', bg: 'bg-orange-500', text: 'text-white' },
  { name: 'yellow', label: 'Yellow', value: '#EAB308', bg: 'bg-yellow-500', text: 'text-white' },
  { name: 'green', label: 'Green', value: '#22C55E', bg: 'bg-green-500', text: 'text-white' },
  { name: 'blue', label: 'Blue', value: '#3B82F6', bg: 'bg-blue-500', text: 'text-white' },
  { name: 'purple', label: 'Purple', value: '#A855F7', bg: 'bg-purple-500', text: 'text-white' },
  { name: 'pink', label: 'Pink', value: '#EC4899', bg: 'bg-pink-500', text: 'text-white' },
  { name: 'gray', label: 'Gray', value: '#6B7280', bg: 'bg-gray-500', text: 'text-white' },
] as const

export type TaskColor = typeof TASK_COLORS[number]

// 색상 이름으로 색상 객체 찾기
export function getTaskColor(colorName?: string): TaskColor | undefined {
  if (!colorName) return undefined
  return TASK_COLORS.find(c => c.name === colorName || c.value === colorName)
}

// 색상별 배경 클래스 매핑 (Tailwind가 정적으로 감지할 수 있도록)
const COLOR_BG_LIGHT_MAP: Record<string, string> = {
  'red': 'bg-red-100 dark:bg-red-900/50',
  'orange': 'bg-orange-100 dark:bg-orange-900/50',
  'yellow': 'bg-yellow-100 dark:bg-yellow-900/50',
  'green': 'bg-green-100 dark:bg-green-900/50',
  'blue': 'bg-blue-100 dark:bg-blue-900/50',
  'purple': 'bg-purple-100 dark:bg-purple-900/50',
  'pink': 'bg-pink-100 dark:bg-pink-900/50',
  'gray': 'bg-gray-100 dark:bg-gray-900/50',
}

// 색상별 텍스트 클래스 매핑 (bgLight용 - 항상 어두운 텍스트)
const COLOR_TEXT_LIGHT_MAP: Record<string, string> = {
  'red': 'text-red-700 dark:text-red-300',
  'orange': 'text-orange-700 dark:text-orange-300',
  'yellow': 'text-yellow-700 dark:text-yellow-300',
  'green': 'text-green-700 dark:text-green-300',
  'blue': 'text-blue-700 dark:text-blue-300',
  'purple': 'text-purple-700 dark:text-purple-300',
  'pink': 'text-pink-700 dark:text-pink-300',
  'gray': 'text-gray-700 dark:text-gray-300',
}

// 색상 스타일 클래스 가져오기
export function getTaskColorClasses(colorName?: string): {
  bg: string;
  text: string;
  border: string;
  bgLight: string;
  textLight: string;
} {
  const color = getTaskColor(colorName)
  if (!color) {
    return {
      bg: 'bg-blue-500',
      text: 'text-white',
      border: 'border-blue-500',
      bgLight: 'bg-blue-100 dark:bg-blue-900/50',
      textLight: 'text-blue-700 dark:text-blue-300'
    }
  }

  return {
    bg: color.bg,
    text: color.text,
    border: color.bg.replace('bg-', 'border-'),
    bgLight: COLOR_BG_LIGHT_MAP[color.name] || 'bg-blue-100 dark:bg-blue-900/50',
    textLight: COLOR_TEXT_LIGHT_MAP[color.name] || 'text-blue-700 dark:text-blue-300'
  }
}
