export default function Logo({ className = "w-8 h-8 text-primary-600 dark:text-primary-400" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 외곽 원 - 시계를 상징 */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.8"
      />

      {/* 중앙 잎사귀 모양 - Linnaeus(식물학자)를 상징 */}
      <path
        d="M50 20 C 35 30, 30 45, 50 60 C 70 45, 65 30, 50 20 Z"
        fill="currentColor"
        opacity="0.3"
      />

      {/* 시계 바늘 - Focus과 Time 관리 */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2="68"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* 중앙 점 */}
      <circle
        cx="50"
        cy="50"
        r="4"
        fill="currentColor"
      />

      {/* 시계 눈금 (12시, 3시, 6시, 9시) */}
      <circle cx="50" cy="15" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="85" cy="50" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="85" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="15" cy="50" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// 텍스트와 함께 사용하는 로고
export function LogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo className="w-8 h-8" />
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-tight">Fotion</span>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
          Focus & Motion
        </span>
      </div>
    </div>
  )
}
