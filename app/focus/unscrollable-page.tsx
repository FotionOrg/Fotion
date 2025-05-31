"use client"

import { useEffect } from "react"

export default function UnScrollablePage({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  return <div className="flex flex-row gap-4 w-full h-full overflow-hidden">{children}</div>
}
