// 작업 블록 색상 팔레트
export const TASK_COLORS = [
  { name: 'gray', label: 'Gray', value: '#6B7280', bg: 'bg-gray-500', text: 'text-white' },
  { name: 'red', label: 'Red', value: '#EF4444', bg: 'bg-red-500', text: 'text-white' },
  { name: 'orange', label: 'Orange', value: '#F97316', bg: 'bg-orange-500', text: 'text-white' },
  { name: 'amber', label: 'Amber', value: '#F59E0B', bg: 'bg-amber-500', text: 'text-white' },
  { name: 'yellow', label: 'Yellow', value: '#EAB308', bg: 'bg-yellow-500', text: 'text-white' },
  { name: 'lime', label: 'Lime', value: '#84CC16', bg: 'bg-lime-500', text: 'text-white' },
  { name: 'green', label: 'Green', value: '#22C55E', bg: 'bg-green-500', text: 'text-white' },
  { name: 'emerald', label: 'Emerald', value: '#10B981', bg: 'bg-emerald-500', text: 'text-white' },
  { name: 'teal', label: 'Teal', value: '#14B8A6', bg: 'bg-teal-500', text: 'text-white' },
  { name: 'cyan', label: 'Cyan', value: '#06B6D4', bg: 'bg-cyan-500', text: 'text-white' },
  { name: 'sky', label: 'Sky', value: '#0EA5E9', bg: 'bg-sky-500', text: 'text-white' },
  { name: 'blue', label: 'Blue', value: '#3B82F6', bg: 'bg-blue-500', text: 'text-white' },
  { name: 'indigo', label: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500', text: 'text-white' },
  { name: 'violet', label: 'Violet', value: '#8B5CF6', bg: 'bg-violet-500', text: 'text-white' },
  { name: 'purple', label: 'Purple', value: '#A855F7', bg: 'bg-purple-500', text: 'text-white' },
  { name: 'fuchsia', label: 'Fuchsia', value: '#D946EF', bg: 'bg-fuchsia-500', text: 'text-white' },
  { name: 'pink', label: 'Pink', value: '#EC4899', bg: 'bg-pink-500', text: 'text-white' },
  { name: 'rose', label: 'Rose', value: '#F43F5E', bg: 'bg-rose-500', text: 'text-white' },
] as const

export type TaskColor = typeof TASK_COLORS[number]

// 색상 이름으로 색상 객체 찾기
export function getTaskColor(colorName?: string): TaskColor | undefined {
  if (!colorName) return undefined
  return TASK_COLORS.find(c => c.name === colorName || c.value === colorName)
}

// 색상 스타일 클래스 가져오기
export function getTaskColorClasses(colorName?: string): { bg: string; text: string; border: string } {
  const color = getTaskColor(colorName)
  if (!color) {
    return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' }
  }
  return {
    bg: color.bg,
    text: color.text,
    border: color.bg.replace('bg-', 'border-')
  }
}
