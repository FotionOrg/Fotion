'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LanguageSwitcher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLanguage = (locale: string) => {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLanguage('en')}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('ko')}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        KO
      </button>
    </div>
  )
}
